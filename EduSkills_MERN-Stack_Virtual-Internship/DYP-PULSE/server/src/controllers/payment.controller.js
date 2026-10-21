import Order from '../models/Order.js';
import PaymentWebhookEvent from '../models/PaymentWebhookEvent.js';
import {
  isRazorpayConfigured,
  isRazorpayTestMode,
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyPaymentWithRazorpayServer,
  verifyWebhookSignature
} from '../services/payment.service.js';
import { sendOrderConfirmationEmail } from '../services/email.service.js';
import { AppError } from '../middleware/errorHandler.js';
import config from '../config/index.js';

/**
 * Get public payment configuration for checkout
 * GET /api/v1/payments/config
 */
export const getPaymentConfig = async (req, res) => {
  const configured = isRazorpayConfigured();
  const testMode = configured ? isRazorpayTestMode() : true;

  res.status(200).json({
    success: true,
    data: {
      isConfigured: configured,
      isTestMode: testMode,
      keyId: configured ? config.razorpay.keyId : null,
      supportedMethods: ['COD', 'ONLINE'],
      currency: 'INR'
    }
  });
};

/**
 * Create or refresh a Razorpay payment order for an existing pending internal order
 * POST /api/v1/payments/create-order
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return next(new AppError('Order ID is required.', 400, 'MISSING_ORDER_ID'));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found.', 404, 'ORDER_NOT_FOUND'));
    }

    // Authorization: User must own the order or be an admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to make payment for this order.', 403, 'FORBIDDEN'));
    }

    // Check order status
    if (order.orderStatus === 'cancelled') {
      return next(
        new AppError('Cannot initiate payment for a cancelled order.', 400, 'ORDER_CANCELLED')
      );
    }

    if (order.paymentStatus === 'paid') {
      return next(
        new AppError('This order has already been paid.', 400, 'ORDER_ALREADY_PAID')
      );
    }

    if (!isRazorpayConfigured()) {
      return res.status(200).json({
        success: false,
        message: 'Razorpay keys not configured on server. Please use Cash on Delivery (COD).',
        data: {
          isConfigured: false,
          fallbackMethod: 'COD'
        }
      });
    }

    const rzpOrder = await createRazorpayOrder(order);

    order.paymentMethod = 'ONLINE';
    order.paymentDetails.razorpayOrderId = rzpOrder.id;
    order.paymentDetails.attemptsCount = (order.paymentDetails.attemptsCount || 0) + 1;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Razorpay payment order created',
      data: {
        isConfigured: true,
        isTestMode: isRazorpayTestMode(),
        keyId: config.razorpay.keyId,
        razorpayOrderId: rzpOrder.id,
        amountInPaise: rzpOrder.amount,
        currency: rzpOrder.currency,
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cryptographically verify Razorpay payment and mark order as paid
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(
        new AppError(
          'Missing payment verification parameters (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature).',
          400,
          'MISSING_VERIFICATION_PARAMS'
        )
      );
    }

    const order = await Order.findById(orderId).populate('user', 'firstName lastName email');
    if (!order) {
      return next(new AppError('Order not found.', 404, 'ORDER_NOT_FOUND'));
    }

    // Ownership check
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to verify payment for this order.', 403, 'FORBIDDEN'));
    }

    // Check if order was cancelled
    if (order.orderStatus === 'cancelled') {
      return next(
        new AppError('Cannot complete payment for an order that has already been cancelled.', 400, 'ORDER_CANCELLED')
      );
    }

    // Idempotency: If already marked paid, return success without duplicate execution
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment was already verified.',
        data: {
          order,
          alreadyPaid: true
        }
      });
    }

    // 1. Cryptographic HMAC-SHA256 signature verification
    verifyRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    // 2. Server-side verification with Razorpay API when online
    let gatewayDetails = null;
    if (isRazorpayConfigured()) {
      gatewayDetails = await verifyPaymentWithRazorpayServer(razorpayPaymentId, order.totalInPaise);
    }

    // 3. Update order payment status (keeping fulfillment orderStatus distinct!)
    order.paymentMethod = 'ONLINE';
    order.paymentStatus = 'paid';
    order.paymentDetails.razorpayOrderId = razorpayOrderId;
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.paymentDetails.paidAt = new Date();
    order.paymentDetails.failureReason = null;

    order.statusHistory.push({
      status: order.orderStatus, // fulfillment status remains separate
      changedBy: req.user._id,
      note: `Online payment of ₹${(order.totalInPaise / 100).toFixed(2)} verified (Razorpay Payment ID: ${razorpayPaymentId})`,
      changedAt: new Date()
    });

    await order.save();

    // 4. Send Order Confirmation Email asynchronously
    sendOrderConfirmationEmail({
      order,
      recipientEmail: order.user?.email || req.user.email
    }).catch((emailErr) => console.error('[Order Email Error]:', emailErr.message));

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and order updated.',
      data: {
        order,
        gatewayDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a failed or cancelled payment attempt
 * POST /api/v1/payments/record-failure
 */
export const recordPaymentFailure = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, error = {} } = req.body;

    if (!orderId) {
      return next(new AppError('Order ID is required.', 400, 'MISSING_ORDER_ID'));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found.', 404, 'ORDER_NOT_FOUND'));
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access this order.', 403, 'FORBIDDEN'));
    }

    // If order was already paid, never regress it to failed
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Order is already marked as paid. Failure report ignored.',
        data: { order }
      });
    }

    order.paymentStatus = 'failed';
    order.paymentDetails.failureReason =
      error.description || error.reason || 'Payment cancelled or declined by customer';
    order.paymentDetails.lastError = error;

    if (razorpayOrderId) order.paymentDetails.razorpayOrderId = razorpayOrderId;
    if (razorpayPaymentId) order.paymentDetails.razorpayPaymentId = razorpayPaymentId;

    order.statusHistory.push({
      status: order.orderStatus, // fulfillment status remains separate
      changedBy: req.user._id,
      note: `Payment attempt failed/cancelled: ${order.paymentDetails.failureReason}`,
      changedAt: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment attempt failure recorded. You may retry or switch to COD.',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Razorpay Webhooks with signature verification and deduplication
 * POST /api/v1/payments/webhook
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

    if (!signature) {
      return res.status(400).json({ error: 'Missing X-Razorpay-Signature header' });
    }

    // Validate signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventId = event.event_id || event.id || `evt_${Date.now()}`;
    const eventType = event.event;

    // Deduplication check: prevent processing the same webhook event multiple times
    const existingEvent = await PaymentWebhookEvent.findOne({ eventId });
    if (existingEvent) {
      return res.status(200).json({ status: 'already_processed', eventId });
    }

    // Process specific Razorpay events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = await Order.findOne({
          'paymentDetails.razorpayOrderId': rzpOrderId
        }).populate('user', 'firstName lastName email');

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.paymentDetails.razorpayPaymentId = paymentId;
          order.paymentDetails.paidAt = new Date();

          order.statusHistory.push({
            status: order.orderStatus,
            note: `Payment captured via Razorpay webhook (${paymentId})`,
            changedAt: new Date()
          });

          await order.save();

          // Send confirmation email
          sendOrderConfirmationEmail({
            order,
            recipientEmail: order.user?.email
          }).catch((e) => console.error('[Webhook Email Error]:', e));
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description || 'Payment failed';

      if (rzpOrderId) {
        const order = await Order.findOne({
          'paymentDetails.razorpayOrderId': rzpOrderId
        });

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed';
          order.paymentDetails.failureReason = errorDesc;
          order.statusHistory.push({
            status: order.orderStatus,
            note: `Payment failure reported via webhook: ${errorDesc}`,
            changedAt: new Date()
          });
          await order.save();
        }
      }
    }

    // Record webhook event to enforce idempotency
    await PaymentWebhookEvent.create({
      eventId,
      eventType,
      paymentId: event.payload?.payment?.entity?.id || null,
      payload: event
    });

    res.status(200).json({ status: 'ok', eventId });
  } catch (error) {
    next(error);
  }
};

/**
 * Switch payment method for an unpaid order (e.g. from ONLINE to COD or vice-versa)
 * POST /api/v1/payments/switch-method/:id
 */
export const switchPaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newMethod } = req.body;

    const normalizedMethod = (newMethod || '').toUpperCase();
    if (!['COD', 'ONLINE'].includes(normalizedMethod)) {
      return next(new AppError('Invalid payment method. Choose COD or ONLINE.', 400, 'INVALID_METHOD'));
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found.', 404, 'ORDER_NOT_FOUND'));
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to modify this order.', 403, 'FORBIDDEN'));
    }

    if (order.paymentStatus === 'paid') {
      return next(new AppError('Cannot change payment method for an already paid order.', 400, 'ALREADY_PAID'));
    }

    if (order.orderStatus === 'cancelled') {
      return next(new AppError('Cannot change payment method for a cancelled order.', 400, 'ORDER_CANCELLED'));
    }

    order.paymentMethod = normalizedMethod;
    if (normalizedMethod === 'COD') {
      order.paymentStatus = 'pending';
    }

    order.statusHistory.push({
      status: order.orderStatus,
      changedBy: req.user._id,
      note: `Payment method switched to ${normalizedMethod}`,
      changedAt: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment method updated to ${normalizedMethod}`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
