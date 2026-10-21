import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import TeamKitRequest from '../models/TeamKitRequest.js';
import {
  reserveProductItemStock,
  releaseProductItemStock
} from '../services/inventory.service.js';
import { initiatePayment } from '../services/payment.service.js';
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail
} from '../services/email.service.js';
import { AppError } from '../middleware/errorHandler.js';

// In-memory orders store for Standalone Resilient Mode
export const standaloneOrders = new Map();
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Pre-calculate checkout summary (subtotal, shipping, coupon, total)
 * POST /api/v1/orders/calculate-summary
 */
export const calculateCheckoutSummary = async (req, res, next) => {
  try {
    const { couponCode } = req.body;

    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          subtotalInPaise: 150000,
          subtotal: 1500,
          shippingChargeInPaise: 0,
          shippingCharge: 0,
          discountInPaise: 0,
          discount: 0,
          totalInPaise: 150000,
          total: 1500,
          itemCount: 1
        }
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          subtotalInPaise: 0,
          subtotal: 0,
          shippingChargeInPaise: 0,
          shippingCharge: 0,
          discountInPaise: 0,
          discount: 0,
          totalInPaise: 0,
          total: 0,
          itemCount: 0
        }
      });
    }

    let subtotalInPaise = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) continue;

      let unitPriceInPaise = product.priceInPaise;
      if (item.sku && product.variants && product.variants.length > 0) {
        const v = product.variants.find((v) => v.sku.toUpperCase() === item.sku.toUpperCase());
        if (v && v.priceOverrideInPaise != null) {
          unitPriceInPaise = v.priceOverrideInPaise;
        }
      }

      subtotalInPaise += unitPriceInPaise * item.quantity;
      itemCount += item.quantity;
    }

    let discountInPaise = 0;
    let appliedCoupon = null;
    const targetCode = couponCode || cart.couponCode;

    if (targetCode) {
      const coupon = await Coupon.findOne({ code: targetCode.toUpperCase(), isActive: true });
      if (coupon) {
        const check = await coupon.isValidForUserAndOrder(req.user._id, subtotalInPaise, {
          items: cart.items
        });
        if (check.valid) {
          discountInPaise = coupon.calculateDiscountInPaise(subtotalInPaise);
          appliedCoupon = {
            code: coupon.code,
            discountInPaise,
            discount: discountInPaise / 100
          };
        }
      }
    }

    const shippingChargeInPaise =
      subtotalInPaise >= 100000 || subtotalInPaise === 0 ? 0 : 9900;
    const totalInPaise = Math.max(0, subtotalInPaise + shippingChargeInPaise - discountInPaise);

    res.status(200).json({
      success: true,
      data: {
        subtotalInPaise,
        subtotal: subtotalInPaise / 100,
        shippingChargeInPaise,
        shippingCharge: shippingChargeInPaise / 100,
        discountInPaise,
        discount: discountInPaise / 100,
        totalInPaise,
        total: totalInPaise / 100,
        itemCount,
        appliedCoupon
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create order from user's cart
 * POST /api/v1/orders
 */
export const createOrder = async (req, res, next) => {
  // Array to track reserved inventory items in case rollback is required
  const reservedItems = [];

  try {
    const {
      shippingAddress,
      paymentMethod = 'COD',
      notes = '',
      couponCode = null,
      idempotencyKey = null
    } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return next(
        new AppError(
          'Complete shipping address (street, city, state, pincode) is required',
          400,
          'INVALID_SHIPPING_ADDRESS'
        )
      );
    }

    // Standalone mode support
    if (!isDbConnected()) {
      const orderId = new mongoose.Types.ObjectId();
      const orderNumber = 'DYP-' + Math.floor(100000 + Math.random() * 900000);
      const mockOrder = {
        _id: orderId,
        id: orderId.toString(),
        orderNumber,
        user: req.user._id,
        items: (req.body.items || []).map((it) => ({
          productId: it.productId || 'mock_prod',
          name: it.name || 'Campus Item',
          price: it.price || 999,
          quantity: it.quantity || 1,
          size: it.size || 'M',
          color: it.color || 'Standard'
        })),
        shippingAddress,
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: paymentMethod.toUpperCase() === 'COD' ? 'pending' : 'paid',
        orderStatus: 'placed',
        subtotal: 1500,
        shippingCharge: 0,
        discount: 0,
        total: 1500,
        createdAt: new Date().toISOString(),
        timeline: [
          { status: 'placed', title: 'Order Placed', timestamp: new Date().toISOString() }
        ],
        toJSON() { return this; }
      };
      standaloneOrders.set(orderId.toString(), mockOrder);
      return res.status(201).json({
        success: true,
        data: {
          order: mockOrder,
          payment: { isConfigured: false, message: 'Campus COD Order Placed' }
        }
      });
    }

    // Idempotency check: if an order with this key was already placed, return it immediately
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        user: req.user._id,
        idempotencyKey: idempotencyKey.trim()
      });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: 'Order already processed',
          data: { order: existingOrder }
        });
      }
    }

    // Fetch user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new AppError('Your cart is empty. Cannot place an order.', 400, 'EMPTY_CART'));
    }

    const orderItems = [];
    let subtotalInPaise = 0;

    // Step 1: Validate each item and calculate line totals authoritatively
    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        return next(
          new AppError(
            `Product "${product ? product.name : 'Item'}" is no longer available in the catalog`,
            400,
            'PRODUCT_UNAVAILABLE'
          )
        );
      }

      let variant = null;
      let targetSku = item.sku ? item.sku.trim().toUpperCase() : '';

      if (product.variants && product.variants.length > 0) {
        if (targetSku) {
          variant = product.variants.find(
            (v) => v.sku && v.sku.toUpperCase() === targetSku
          );
        } else {
          variant = product.variants.find(
            (v) =>
              (!item.size || v.size === item.size) &&
              (!item.color || v.color === item.color)
          );
        }

        if (variant) {
          targetSku = variant.sku;
        } else {
          return next(
            new AppError(
              `Selected variant (SKU: ${targetSku || 'N/A'}, Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}) is not valid for product "${product.name}".`,
              400,
              'VARIANT_MISMATCH'
            )
          );
        }
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < item.quantity) {
        return next(
          new AppError(
            `Insufficient stock for "${product.name}"${
              targetSku ? ` (SKU: ${targetSku})` : ''
            }. Only ${availableStock} units remaining.`,
            400,
            'INSUFFICIENT_STOCK'
          )
        );
      }

      const unitPriceInPaise =
        variant && variant.priceOverrideInPaise != null
          ? variant.priceOverrideInPaise
          : product.priceInPaise;

      const lineTotalInPaise = unitPriceInPaise * item.quantity;
      subtotalInPaise += lineTotalInPaise;

      orderItems.push({
        product: product._id,
        sku: targetSku,
        name: product.name,
        size: item.size || (variant ? variant.size : ''),
        color: item.color || (variant ? variant.color : ''),
        image:
          (variant && variant.image) ||
          (product.images && product.images.length > 0 ? product.images[0].url : ''),
        unitPriceInPaise,
        quantity: item.quantity,
        lineTotalInPaise
      });
    }

    // Step 2: Validate coupon if applied
    let discountInPaise = 0;
    let couponRecord = null;
    const targetCoupon = couponCode || cart.couponCode;

    if (targetCoupon) {
      const coupon = await Coupon.findOne({ code: targetCoupon.toUpperCase(), isActive: true });
      if (coupon) {
        const check = await coupon.isValidForUserAndOrder(req.user._id, subtotalInPaise, {
          items: orderItems
        });
        if (check.valid) {
          // Atomically reserve usage limit to prevent concurrent over-usage
          const updatedCoupon = await Coupon.findOneAndUpdate(
            { _id: coupon._id, usageCount: { $lt: coupon.usageLimit } },
            { $inc: { usageCount: 1 } },
            { new: true }
          );

          if (updatedCoupon) {
            discountInPaise = coupon.calculateDiscountInPaise(subtotalInPaise);
            couponRecord = {
              code: coupon.code,
              discountInPaise
            };
          }
        }
      }
    }

    // Step 3: Authoritative calculation of shipping and final total in paise
    // Free campus shipping on orders >= Rs. 1000 (100,000 paise), else Rs. 99 (9,900 paise)
    const shippingChargeInPaise = subtotalInPaise >= 100000 ? 0 : 9900;
    const totalInPaise = Math.max(0, subtotalInPaise + shippingChargeInPaise - discountInPaise);

    // Step 4: Atomic Inventory Deduction with rollback safeguard
    for (const item of orderItems) {
      try {
        await reserveProductItemStock(
          item.product,
          { sku: item.sku, size: item.size, color: item.color },
          item.quantity
        );
        reservedItems.push(item);
      } catch (reserveError) {
        // Rollback all previously reserved items
        for (const reserved of reservedItems) {
          await releaseProductItemStock(
            reserved.product,
            { sku: reserved.sku, size: reserved.size, color: reserved.color },
            reserved.quantity
          ).catch((e) => console.error('Inventory rollback failure:', e));
        }

        // Rollback coupon usage if reserved
        if (couponRecord && couponRecord.code) {
          await Coupon.updateOne(
            { code: couponRecord.code, usageCount: { $gt: 0 } },
            { $inc: { usageCount: -1 } }
          ).catch((e) => console.error('Coupon rollback failure:', e));
        }

        return next(
          new AppError(
            reserveError.message || `Could not reserve stock for "${item.name}". Please try again.`,
            409,
            'STOCK_RESERVATION_FAILED'
          )
        );
      }
    }

    // Step 5: Persist Order Document
    const order = new Order({
      user: req.user._id,
      idempotencyKey: idempotencyKey ? idempotencyKey.trim() : undefined,
      items: orderItems,
      shippingAddress: {
        fullName:
          shippingAddress.fullName ||
          `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
          'Collegiate Athlete',
        phone: shippingAddress.phone || req.user.phone || '',
        street: shippingAddress.street.trim(),
        apartment: (shippingAddress.apartment || '').trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus: 'pending',
      orderStatus: 'placed',
      subtotalInPaise,
      shippingChargeInPaise,
      discountInPaise,
      totalInPaise,
      coupon: couponRecord || undefined,
      statusHistory: [
        {
          status: 'placed',
          changedBy: req.user._id,
          note: `Order submitted via ${paymentMethod.toUpperCase()}`,
          changedAt: new Date()
        }
      ],
      notes: notes.trim()
    });

    await order.save();

    // Step 6: Clear cart upon successful order creation
    cart.items = [];
    cart.couponCode = null;
    await cart.save();

    // Step 7: Payment initialization
    const paymentInfo = await initiatePayment(order, paymentMethod);

    // Step 8: Trigger order confirmation email for COD orders
    if (paymentMethod.toUpperCase() === 'COD') {
      sendOrderConfirmationEmail({
        order,
        recipientEmail: req.user.email
      }).catch((e) => console.error('[Order Confirmation Email Error]:', e.message));
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        payment: paymentInfo
      }
    });
  } catch (error) {
    // If an unexpected error occurs during order document persistence, release reserved inventory
    for (const reserved of reservedItems) {
      await releaseProductItemStock(
        reserved.product,
        { sku: reserved.sku, size: reserved.size, color: reserved.color },
        reserved.quantity
      ).catch((e) => console.error('Post-error inventory rollback failure:', e));
    }
    if (couponRecord && couponRecord.code) {
      await Coupon.updateOne(
        { code: couponRecord.code, usageCount: { $gt: 0 } },
        { $inc: { usageCount: -1 } }
      ).catch((e) => console.error('Post-error coupon rollback failure:', e));
    }
    next(error);
  }
};

/**
 * Get orders placed by current user
 * GET /api/v1/orders/my-orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    if (!isDbConnected()) {
      const userOrders = Array.from(standaloneOrders.values()).filter(
        (o) => o.user && o.user.toString() === req.user._id.toString()
      );
      return res.status(200).json({
        success: true,
        data: {
          orders: userOrders,
          pagination: { total: userOrders.length, page: 1, limit: 10, pages: 1 }
        }
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments({ user: req.user._id })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific order by ID or Order Number
 * GET /api/v1/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const order = standaloneOrders.get(id) || Array.from(standaloneOrders.values()).find(o => o.orderNumber === id || o.id === id);
      if (!order) {
        return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
      }
      return res.status(200).json({
        success: true,
        data: { order }
      });
    }

    // Search by ObjectId or orderNumber
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('user', 'firstName lastName email phone');
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('user', 'firstName lastName email phone');
    }

    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    // Authorization: User must be owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access this order', 403, 'FORBIDDEN'));
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order (Customer request)
 * POST /api/v1/orders/:id/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by student' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to cancel this order', 403, 'FORBIDDEN'));
    }

    // Validation: only placed or confirmed orders can be cancelled directly by customer
    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return next(
        new AppError(
          `Order cannot be cancelled because it is already ${order.orderStatus}. Please contact campus varsity support.`,
          400,
          'ORDER_CANCELLATION_DISALLOWED'
        )
      );
    }

    // Replenish inventory atomically for all order items if not already restocked
    if (!order.cancellation?.restocked) {
      for (const item of order.items) {
        await releaseProductItemStock(
          item.product,
          { sku: item.sku, size: item.size, color: item.color },
          item.quantity
        );
      }

      // Replenish coupon usage limit if a coupon was used
      if (order.coupon && order.coupon.code) {
        await Coupon.updateOne(
          { code: order.coupon.code, usageCount: { $gt: 0 } },
          { $inc: { usageCount: -1 } }
        ).catch((e) => console.error('Coupon restock on cancellation failure:', e));
      }
    }

    order.orderStatus = 'cancelled';
    order.cancellation = {
      reason: reason.trim(),
      requestedBy: req.user._id,
      cancelledAt: new Date(),
      restocked: true
    };

    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    order.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user._id,
      note: `Cancelled by customer: ${reason.trim()}`,
      changedAt: new Date()
    });

    await order.save();

    // Trigger cancellation confirmation email
    sendOrderCancellationEmail({
      order,
      recipientEmail: req.user.email,
      reason: reason.trim()
    }).catch((e) => console.error('[Order Cancellation Email Error]:', e.message));

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory replenished',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (Admin)
 * GET /api/v1/orders/all
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (orderStatus && orderStatus !== 'ALL') {
      filter.orderStatus = orderStatus.toLowerCase();
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      filter.paymentStatus = paymentStatus.toLowerCase();
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.city': searchRegex },
        { 'shippingAddress.phone': searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin)
 * PUT /api/v1/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, note = '' } = req.body;

    const order = await Order.findById(id).populate('user', 'firstName lastName email');
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    const validOrderStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    // If order was already cancelled, prevent changing status
    if (order.orderStatus === 'cancelled' && orderStatus && orderStatus !== 'cancelled') {
      return next(
        new AppError('Cannot alter status of an already cancelled order', 400, 'ORDER_ALREADY_CANCELLED')
      );
    }

    if (orderStatus) {
      if (!validOrderStatuses.includes(orderStatus.toLowerCase())) {
        return next(
          new AppError(
            `Invalid order status. Must be one of: ${validOrderStatuses.join(', ')}`,
            400,
            'INVALID_ORDER_STATUS'
          )
        );
      }

      const newStatus = orderStatus.toLowerCase();

      // If transition is to cancelled, replenish inventory if not yet restocked
      if (newStatus === 'cancelled' && !order.cancellation?.restocked) {
        for (const item of order.items) {
          await releaseProductItemStock(
            item.product,
            { sku: item.sku, size: item.size, color: item.color },
            item.quantity
          );
        }

        // Replenish coupon usage limit if a coupon was used
        if (order.coupon && order.coupon.code) {
          await Coupon.updateOne(
            { code: order.coupon.code, usageCount: { $gt: 0 } },
            { $inc: { usageCount: -1 } }
          ).catch((e) => console.error('Coupon restock on admin cancellation failure:', e));
        }

        order.cancellation = {
          reason: note || 'Cancelled by administrator',
          requestedBy: req.user._id,
          cancelledAt: new Date(),
          restocked: true
        };
      }

      // If delivered for COD, automatically mark payment paid
      if (newStatus === 'delivered' && order.paymentMethod === 'COD' && order.paymentStatus === 'pending') {
        order.paymentStatus = 'paid';
      }

      order.orderStatus = newStatus;
      order.statusHistory.push({
        status: newStatus,
        changedBy: req.user._id,
        note: note.trim() || `Status updated to ${newStatus} by admin`,
        changedAt: new Date()
      });
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus.toLowerCase())) {
        return next(
          new AppError(
            `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`,
            400,
            'INVALID_PAYMENT_STATUS'
          )
        );
      }
      order.paymentStatus = paymentStatus.toLowerCase();
    }

    await order.save();

    // Trigger order status update notification if order status changed
    if (orderStatus) {
      sendOrderStatusUpdateEmail({
        order,
        recipientEmail: order.user?.email,
        newStatus: order.orderStatus,
        note: note ? note.trim() : ''
      }).catch((e) => console.error('[Order Status Email Error]:', e.message));
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive, database-derived admin analytics
 * GET /api/v1/orders/admin/analytics
 */
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;

    // 1. Build date filter for orders and temporal records
    const orderDateMatch = {};
    const now = new Date();

    if (startDate || endDate) {
      orderDateMatch.createdAt = {};
      if (startDate) orderDateMatch.createdAt.$gte = new Date(startDate);
      if (endDate) orderDateMatch.createdAt.$lte = new Date(endDate);
    } else if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      orderDateMatch.createdAt = { $gte: startOfDay };
    } else if (period === '7d' || period === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      orderDateMatch.createdAt = { $gte: sevenDaysAgo };
    } else if (period === '30d' || period === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      orderDateMatch.createdAt = { $gte: thirtyDaysAgo };
    } else if (period === 'year') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      orderDateMatch.createdAt = { $gte: oneYearAgo };
    }

    // 2. Order Status Breakdown & Revenue Aggregations
    const orderAggregations = await Order.aggregate([
      { $match: orderDateMatch },
      {
        $group: {
          _id: {
            orderStatus: '$orderStatus',
            paymentStatus: '$paymentStatus',
            paymentMethod: '$paymentMethod'
          },
          count: { $sum: 1 },
          totalInPaise: { $sum: '$totalInPaise' }
        }
      }
    ]);

    const statusMap = {
      placed: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    let totalOrders = 0;
    let qualifyingOrdersCount = 0;
    let collectedRevenueInPaise = 0;
    let unpaidCodRevenueInPaise = 0;
    let pipelineRevenueInPaise = 0;
    let awaitingProcessingCount = 0;

    for (const group of orderAggregations) {
      const { orderStatus, paymentStatus, paymentMethod } = group._id;
      const count = group.count;
      const revenue = group.totalInPaise || 0;

      totalOrders += count;
      if (statusMap[orderStatus] !== undefined) {
        statusMap[orderStatus] += count;
      }

      // Orders awaiting processing: placed, confirmed, or processing
      if (['placed', 'confirmed', 'processing'].includes(orderStatus)) {
        awaitingProcessingCount += count;
      }

      // BUSINESS REVENUE DEFINITIONS:
      // Rule 1: Exclude cancelled orders from all sales & revenue metrics
      if (orderStatus === 'cancelled') {
        continue;
      }

      // Rule 2: Strictly count paid orders as collected revenue (Razorpay paid + delivered COD)
      // Unpaid COD orders (pending) are NOT counted as collected revenue
      if (paymentStatus === 'paid') {
        collectedRevenueInPaise += revenue;
        qualifyingOrdersCount += count;
      } else if (paymentMethod === 'COD' && paymentStatus === 'pending') {
        unpaidCodRevenueInPaise += revenue;
      }

      // Rule 3: Pipeline revenue includes active unfulfilled orders
      if (['placed', 'confirmed', 'processing', 'shipped'].includes(orderStatus)) {
        pipelineRevenueInPaise += revenue;
      }
    }

    // Average Order Value strictly based on qualifying collected orders
    const averageOrderValueInPaise =
      qualifyingOrdersCount > 0 ? Math.round(collectedRevenueInPaise / qualifyingOrdersCount) : 0;

    // 3. Total Customers Count
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 4. Products Catalog Counts & Low Stock Variants
    const [totalProducts, activeProducts, playCount, campusCount] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ department: 'PLAY', isActive: true }),
      Product.countDocuments({ department: 'CAMPUS', isActive: true })
    ]);

    const lowStockProducts = await Product.find({
      isActive: true,
      $or: [{ stock: { $lte: 5 } }, { 'variants.stock': { $lte: 5 } }]
    }).select('name slug stock variants priceInPaise department');

    let lowStockVariantCount = 0;
    const lowStockDetails = [];

    for (const prod of lowStockProducts) {
      if (prod.variants && prod.variants.length > 0) {
        for (const v of prod.variants) {
          if (v.stock <= 5) {
            lowStockVariantCount++;
            lowStockDetails.push({
              productId: prod._id,
              productName: prod.name,
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: v.stock
            });
          }
        }
      } else if (prod.stock <= 5) {
        lowStockVariantCount++;
        lowStockDetails.push({
          productId: prod._id,
          productName: prod.name,
          sku: 'BASE',
          stock: prod.stock
        });
      }
    }

    // 5. Top-selling products based on actual non-cancelled order data in date range
    const topSellingAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, ...orderDateMatch } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.quantity' },
          revenueInPaise: { $sum: '$items.lineTotalInPaise' }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);

    const topSellingProducts = topSellingAggregation.map((item) => ({
      productId: item._id,
      name: item.name,
      sku: item.sku,
      image: item.image,
      unitsSold: item.unitsSold,
      revenueInPaise: item.revenueInPaise,
      revenue: item.revenueInPaise / 100
    }));

    // 6. Team Kit Request Pipeline by Status
    const teamKitDateMatch = orderDateMatch.createdAt ? { createdAt: orderDateMatch.createdAt } : {};
    const teamKitStatusCounts = await TeamKitRequest.aggregate([
      { $match: teamKitDateMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const teamKitStats = {
      total: 0,
      byStatus: {
        submitted: 0,
        reviewing: 0,
        quoted: 0,
        approved: 0,
        in_production: 0,
        shipped: 0,
        completed: 0,
        rejected: 0
      }
    };

    for (const group of teamKitStatusCounts) {
      teamKitStats.total += group.count;
      teamKitStats.byStatus[group._id] = group.count;
    }

    // 7. Recent Order Activity
    const recentOrders = await Order.find(orderDateMatch)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(8);

    // 8. Explicit Business Metric Definitions
    const definitions = {
      qualifyingRevenue:
        'Gross collected revenue strictly from paid transactions (Razorpay and delivered COD). Excludes unpaid COD and cancelled orders. Refunds are subtracted.',
      unpaidCodRevenue:
        'Pipeline value of Cash on Delivery orders awaiting customer delivery and cash collection.',
      averageOrderValue:
        'Qualifying collected revenue divided by qualifying paid order count in the selected period.',
      ordersAwaitingProcessing:
        'Orders currently in placed, confirmed, or processing states requiring varsity squad dispatch.',
      lowStockVariants:
        'Active catalog SKUs or products with 5 or fewer remaining units in college inventory.',
      topSellingProducts:
        'Top catalog gear ranked by verified units sold across all non-cancelled orders.'
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        orders: {
          total: totalOrders,
          qualifyingCount: qualifyingOrdersCount,
          awaitingProcessing: awaitingProcessingCount,
          byStatus: statusMap
        },
        revenue: {
          qualifyingRevenueInPaise: collectedRevenueInPaise,
          qualifyingRevenue: collectedRevenueInPaise / 100,
          unpaidCodRevenueInPaise,
          unpaidCodRevenue: unpaidCodRevenueInPaise / 100,
          pipelineRevenueInPaise,
          pipelineRevenue: pipelineRevenueInPaise / 100,
          averageOrderValueInPaise,
          averageOrderValue: averageOrderValueInPaise / 100,
          rules: definitions.qualifyingRevenue
        },
        customers: {
          total: totalCustomers
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          byDepartment: {
            PLAY: playCount,
            CAMPUS: campusCount
          },
          lowStockVariantCount,
          lowStockDetails: lowStockDetails.slice(0, 10)
        },
        topSellingProducts,
        teamKits: teamKitStats,
        recentOrders,
        definitions
      }
    });
  } catch (error) {
    next(error);
  }
};

