import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorHandler.js';
import { getFallbackProductById } from '../services/catalogFallback.service.js';

// In-memory carts store for Standalone Resilient Mode
const standaloneCarts = new Map();
const isDbConnected = () => mongoose.connection.readyState === 1;

const getStandaloneCart = (userId) => {
  const uid = userId ? userId.toString() : 'guest';
  if (!standaloneCarts.has(uid)) {
    standaloneCarts.set(uid, {
      _id: 'cart_' + uid,
      user: uid,
      items: [],
      couponCode: null,
      save() { return Promise.resolve(this); },
      populate() { return Promise.resolve(this); }
    });
  }
  return standaloneCarts.get(uid);
};

/**
 * Calculate authoritative summary for a cart
 */
const calculateCartSummary = async (cart) => {
  const itemCount = (cart.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotalInPaise = (cart.items || []).reduce(
    (sum, item) => sum + (item.priceInPaise || 0) * (item.quantity || 1),
    0
  );

  let discountInPaise = 0;
  let appliedCoupon = null;

  if (cart.couponCode) {
    if (isDbConnected()) {
      const coupon = await Coupon.findOne({ code: cart.couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const check = coupon.isValidForOrder(subtotalInPaise);
        if (check.valid) {
          discountInPaise = coupon.calculateDiscountInPaise(subtotalInPaise);
          appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountInPaise,
            discount: discountInPaise / 100
          };
        } else {
          // Automatically drop invalid/expired coupon
          cart.couponCode = null;
          await cart.save();
        }
      } else {
        cart.couponCode = null;
        await cart.save();
      }
    } else {
      const code = cart.couponCode.toUpperCase();
      if (code === 'CAMPUS10') {
        discountInPaise = Math.round(subtotalInPaise * 0.10);
        appliedCoupon = { code: 'CAMPUS10', discountType: 'percentage', discountValue: 10, discountInPaise, discount: discountInPaise / 100 };
      } else if (code === 'VARSITY20') {
        discountInPaise = Math.round(subtotalInPaise * 0.20);
        appliedCoupon = { code: 'VARSITY20', discountType: 'percentage', discountValue: 20, discountInPaise, discount: discountInPaise / 100 };
      }
    }
  }

  // Shipping logic: Free for orders >= Rs. 1000 (100,000 paise), else Rs. 99 (9,900 paise)
  const shippingInPaise = subtotalInPaise >= 100000 || subtotalInPaise === 0 ? 0 : 9900;
  const totalInPaise = Math.max(0, subtotalInPaise + shippingInPaise - discountInPaise);

  return {
    itemCount,
    subtotalInPaise,
    subtotal: subtotalInPaise / 100,
    shippingChargeInPaise: shippingInPaise,
    shippingCharge: shippingInPaise / 100,
    discountInPaise,
    discount: discountInPaise / 100,
    totalInPaise,
    total: totalInPaise / 100,
    appliedCoupon
  };
};

/**
 * Get current user's shopping cart
 * GET /api/v1/cart
 */
export const getCart = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const cart = getStandaloneCart(req.user._id);
      const summary = await calculateCartSummary(cart);
      return res.status(200).json({
        success: true,
        data: { cart, summary }
      });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug priceInPaise compareAtPriceInPaise images stock department category variants isActive'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Server-side validation: sync prices from DB and remove inactive products
    let itemsModified = false;
    const validItems = [];

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        itemsModified = true;
        continue;
      }

      const product = item.product;
      let authoritativePriceInPaise = product.priceInPaise;

      // Check variant price override if SKU matches
      if (item.sku && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) => v.sku && v.sku.toUpperCase() === item.sku.toUpperCase()
        );
        if (variant && variant.priceOverrideInPaise) {
          authoritativePriceInPaise = variant.priceOverrideInPaise;
        }
      }

      // Sync price with DB
      if (item.priceInPaise !== authoritativePriceInPaise) {
        item.priceInPaise = authoritativePriceInPaise;
        itemsModified = true;
      }

      validItems.push(item);
    }

    if (itemsModified) {
      cart.items = validItems;
      await cart.save();
    }

    const summary = await calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an item to the user's cart
 * POST /api/v1/cart/add
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = '', color = '', sku = '' } = req.body;

    if (!productId) {
      return next(new AppError('Product ID is required', 400, 'MISSING_PRODUCT_ID'));
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!isDbConnected()) {
      const product = getFallbackProductById(productId);
      if (!product) {
        return next(new AppError('Product not found or currently unavailable', 404, 'PRODUCT_NOT_FOUND'));
      }
      const cart = getStandaloneCart(req.user._id);
      const priceInPaise = product.priceInPaise || (product.price ? product.price * 100 : 0);
      const chosenSize = size || (product.variants?.[0]?.size) || 'M';
      const chosenColor = color || (product.variants?.[0]?.color) || 'Standard';
      const chosenSku = sku || (product.variants?.[0]?.sku) || '';

      const existing = cart.items.find(
        (it) =>
          ((it.product?._id || it.product) === productId) &&
          it.size === chosenSize &&
          it.color === chosenColor
      );

      if (existing) {
        existing.quantity += qty;
      } else {
        cart.items.push({
          _id: 'ci_' + Date.now() + Math.random().toString(36).slice(2, 6),
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            priceInPaise,
            images: product.images,
            stock: product.stock || 50,
            department: product.department,
            category: product.category,
            isActive: true
          },
          size: chosenSize,
          color: chosenColor,
          sku: chosenSku,
          quantity: qty,
          priceInPaise
        });
      }

      const summary = await calculateCartSummary(cart);
      return res.status(200).json({
        success: true,
        message: 'Item added to bag',
        data: { cart, summary }
      });
    }

    // Fetch product to validate price, active status, and stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not found or currently unavailable', 404, 'PRODUCT_NOT_FOUND'));
    }

    // Determine variant matching
    let targetVariant = null;
    let targetSku = sku ? sku.trim().toUpperCase() : '';

    if (product.variants && product.variants.length > 0) {
      if (targetSku) {
        targetVariant = product.variants.find(
          (v) => v.sku && v.sku.toUpperCase() === targetSku
        );
      } else {
        targetVariant = product.variants.find(
          (v) => (!size || v.size === size) && (!color || v.color === color)
        );
      }

      if (!targetVariant) {
        return next(
          new AppError(
            `Selected variant (SKU: ${targetSku || 'N/A'}, Size: ${size || 'N/A'}, Color: ${color || 'N/A'}) is not valid for product "${product.name}".`,
            400,
            'VARIANT_MISMATCH'
          )
        );
      }

      targetSku = targetVariant.sku;
    }

    // Authoritative price in paise
    const authoritativePriceInPaise =
      targetVariant && targetVariant.priceOverrideInPaise != null
        ? targetVariant.priceOverrideInPaise
        : product.priceInPaise;

    // Check variant stock or product stock
    const maxStock = targetVariant ? targetVariant.stock : product.stock;

    if (maxStock < qty) {
      return next(
        new AppError(
          `Insufficient stock available. Only ${maxStock} items remaining.`,
          400,
          'INSUFFICIENT_STOCK'
        )
      );
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if matching item is already in cart (same product + sku/size/color)
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() &&
        (targetSku ? (item.sku || '').toUpperCase() === targetSku : true) &&
        (item.size || '') === (size || (targetVariant?.size || '')) &&
        (item.color || '') === (color || (targetVariant?.color || ''))
    );

    if (existingIndex > -1) {
      const newQuantity = cart.items[existingIndex].quantity + qty;
      if (newQuantity > maxStock) {
        return next(
          new AppError(
            `Cannot add ${qty} more. Maximum stock reached (${maxStock} in stock).`,
            400,
            'MAX_STOCK_EXCEEDED'
          )
        );
      }
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].priceInPaise = authoritativePriceInPaise;
    } else {
      cart.items.push({
        product: product._id,
        sku: targetSku,
        quantity: qty,
        size: size || (targetVariant?.size || ''),
        color: color || (targetVariant?.color || ''),
        priceInPaise: authoritativePriceInPaise
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug priceInPaise compareAtPriceInPaise images stock department category variants isActive'
    });

    const summary = await calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      message: 'Item added to bag',
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update quantity of a cart item
 * PUT /api/v1/cart/:itemId
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const targetId = req.params.itemId || req.body.cartItemId || req.body.itemId;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(Number(quantity))) {
      return next(new AppError('Quantity must be a valid number', 400, 'INVALID_QUANTITY'));
    }

    const qty = parseInt(quantity, 10);
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new AppError('Cart not found', 404, 'CART_NOT_FOUND'));
    }

    const item =
      cart.items.id(targetId) ||
      cart.items.find(
        (i) =>
          i._id.toString() === targetId ||
          i.product.toString() === targetId ||
          (i.sku && i.sku.toUpperCase() === (targetId || '').toUpperCase())
      );

    if (!item) {
      return next(new AppError('Item not found in cart', 404, 'CART_ITEM_NOT_FOUND'));
    }

    if (qty <= 0) {
      cart.items.pull(item._id);
    } else {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        cart.items.pull(item._id);
        await cart.save();
        return next(
          new AppError('Product is no longer available and was removed from cart', 404, 'PRODUCT_UNAVAILABLE')
        );
      }

      let maxStock = product.stock;
      let priceInPaise = product.priceInPaise;

      if (item.sku && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) => v.sku && v.sku.toUpperCase() === item.sku.toUpperCase()
        );
        if (variant) {
          maxStock = variant.stock;
          if (variant.priceOverrideInPaise != null) {
            priceInPaise = variant.priceOverrideInPaise;
          }
        }
      }

      if (qty > maxStock) {
        return next(
          new AppError(
            `Requested quantity exceeds available stock (${maxStock} available)`,
            400,
            'INSUFFICIENT_STOCK'
          )
        );
      }

      item.quantity = qty;
      item.priceInPaise = priceInPaise;
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug priceInPaise compareAtPriceInPaise images stock department category variants isActive'
    });

    const summary = await calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an item from the cart
 * DELETE /api/v1/cart/:itemId
 */
export const removeCartItem = async (req, res, next) => {
  try {
    const targetId = req.params.itemId || req.body.cartItemId || req.body.itemId;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new AppError('Cart not found', 404, 'CART_NOT_FOUND'));
    }

    const item =
      cart.items.id(targetId) ||
      cart.items.find(
        (i) =>
          i._id.toString() === targetId ||
          i.product.toString() === targetId ||
          (i.sku && i.sku.toUpperCase() === (targetId || '').toUpperCase())
      );

    if (!item) {
      return next(new AppError('Item not found in cart', 404, 'CART_ITEM_NOT_FOUND'));
    }

    cart.items.pull(item._id);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug priceInPaise compareAtPriceInPaise images stock department category variants isActive'
    });

    const summary = await calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all items in user's cart
 * DELETE /api/v1/cart/clear
 */
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
      cart.couponCode = null;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart,
        summary: {
          itemCount: 0,
          subtotalInPaise: 0,
          subtotal: 0,
          shippingChargeInPaise: 0,
          shippingCharge: 0,
          discountInPaise: 0,
          discount: 0,
          totalInPaise: 0,
          total: 0,
          appliedCoupon: null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Synchronize guest cart items with server upon login
 * POST /api/v1/cart/sync
 */
export const syncGuestCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items)) {
      return next(new AppError('Items must be an array', 400, 'INVALID_ITEMS'));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const guestItem of items) {
      const prodId = guestItem.productId || guestItem.product?._id || guestItem.product;
      if (!prodId) continue;

      const product = await Product.findById(prodId);
      if (!product || !product.isActive) continue;

      const qty = Math.max(1, parseInt(guestItem.quantity, 10) || 1);
      const sku = guestItem.sku || '';
      const size = guestItem.size || '';
      const color = guestItem.color || '';

      let targetVariant = null;
      if (product.variants && product.variants.length > 0) {
        targetVariant =
          (sku && product.variants.find((v) => v.sku.toUpperCase() === sku.toUpperCase())) ||
          product.variants.find((v) => (!size || v.size === size) && (!color || v.color === color)) ||
          product.variants[0];
      }

      const availableStock = targetVariant ? targetVariant.stock : product.stock;
      const priceInPaise =
        targetVariant && targetVariant.priceOverrideInPaise != null
          ? targetVariant.priceOverrideInPaise
          : product.priceInPaise;

      const existingIndex = cart.items.findIndex(
        (it) =>
          it.product.toString() === product._id.toString() &&
          (sku ? (it.sku || '').toUpperCase() === sku.toUpperCase() : true) &&
          (it.size || '') === (size || '') &&
          (it.color || '') === (color || '')
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          availableStock,
          cart.items[existingIndex].quantity + qty
        );
        cart.items[existingIndex].priceInPaise = priceInPaise;
      } else if (availableStock >= 1) {
        cart.items.push({
          product: product._id,
          sku: targetVariant ? targetVariant.sku : '',
          quantity: Math.min(availableStock, qty),
          size: size || (targetVariant?.size || ''),
          color: color || (targetVariant?.color || ''),
          priceInPaise
        });
      }
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug priceInPaise compareAtPriceInPaise images stock department category variants isActive'
    });

    const summary = await calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      message: 'Cart synchronized with server',
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply coupon to cart
 * POST /api/v1/cart/coupon
 */
export const applyCouponToCart = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return next(new AppError('Coupon code is required', 400, 'MISSING_COUPON_CODE'));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cannot apply coupon to an empty cart', 400, 'EMPTY_CART'));
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return next(new AppError(`Coupon '${cleanCode}' is invalid`, 404, 'COUPON_NOT_FOUND'));
    }

    const check = coupon.isValidForOrder(cart.subtotalInPaise);
    if (!check.valid) {
      return next(new AppError(check.message, 400, 'COUPON_NOT_APPLICABLE'));
    }

    cart.couponCode = coupon.code;
    await cart.save();

    const summary = await calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully`,
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove coupon from cart
 * DELETE /api/v1/cart/coupon
 */
export const removeCouponFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.couponCode = null;
      await cart.save();
    }

    const summary = cart ? await calculateCartSummary(cart) : null;

    res.status(200).json({
      success: true,
      message: 'Coupon removed from cart',
      data: {
        cart,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};
