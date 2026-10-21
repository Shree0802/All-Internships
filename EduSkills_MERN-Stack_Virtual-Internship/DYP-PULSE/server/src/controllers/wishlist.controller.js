import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get current user's wishlist
 * GET /api/v1/wishlist
 */
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug priceInPaise compareAtPriceInPaise images stock department category brand sport isActive'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Filter items and flag availability gracefully
    const formattedItems = [];
    for (const item of wishlist.items) {
      if (!item.product) continue;

      const p = item.product;
      formattedItems.push({
        _id: item._id,
        productId: p._id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        department: p.department,
        category: p.category,
        priceInPaise: p.priceInPaise,
        price: p.price,
        compareAtPriceInPaise: p.compareAtPriceInPaise,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        image: p.images && p.images.length > 0 ? p.images[0].url : '',
        inStock: p.stock > 0,
        stock: p.stock,
        isActive: p.isActive,
        addedAt: item.addedAt
      });
    }

    res.status(200).json({
      success: true,
      data: {
        wishlist: formattedItems,
        count: formattedItems.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add product to wishlist
 * POST /api/v1/wishlist
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return next(new AppError('Product ID is required', 400, 'MISSING_PRODUCT_ID'));
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not found or unavailable', 404, 'PRODUCT_NOT_FOUND'));
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check duplicate
    const exists = wishlist.items.some(
      (item) => item.product.toString() === productId.toString()
    );

    if (exists) {
      return res.status(200).json({
        success: true,
        message: 'Product already in wishlist',
        data: { wishlist: wishlist.items, count: wishlist.items.length }
      });
    }

    wishlist.items.unshift({ product: product._id, addedAt: new Date() });
    await wishlist.save();

    await wishlist.populate({
      path: 'items.product',
      select: 'name slug priceInPaise images stock department brand isActive'
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        wishlist: wishlist.items,
        count: wishlist.items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove product from wishlist
 * DELETE /api/v1/wishlist/:productId
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { wishlist: [], count: 0 }
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) =>
        item.product.toString() !== productId.toString() &&
        item._id.toString() !== productId.toString()
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        wishlist: wishlist.items,
        count: wishlist.items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Move wishlist item to cart
 * POST /api/v1/wishlist/move-to-cart/:productId
 */
export const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity = 1, size = '', color = '' } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product is no longer available', 404, 'PRODUCT_UNAVAILABLE'));
    }

    if (product.stock < quantity) {
      return next(new AppError('Product is currently out of stock', 400, 'OUT_OF_STOCK'));
    }

    // Determine variant and price
    let targetSku = '';
    let priceInPaise = product.priceInPaise;

    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => (!size || v.size === size) && (!color || v.color === color)
      ) || product.variants[0];

      if (variant) {
        targetSku = variant.sku;
        if (variant.priceOverrideInPaise) {
          priceInPaise = variant.priceOverrideInPaise;
        }
        if (variant.stock < quantity) {
          return next(
            new AppError(`Variant ${variant.sku} does not have enough stock`, 400, 'INSUFFICIENT_STOCK')
          );
        }
      }
    }

    // Add to user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() &&
        (item.sku || '') === (targetSku || '') &&
        (item.size || '') === (size || '') &&
        (item.color || '') === (color || '')
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].priceInPaise = priceInPaise;
    } else {
      cart.items.push({
        product: product._id,
        sku: targetSku,
        quantity,
        size: size || (product.variants?.[0]?.size || ''),
        color: color || (product.variants?.[0]?.color || ''),
        priceInPaise
      });
    }

    await cart.save();

    // Remove from wishlist
    await Wishlist.updateOne(
      { user: req.user._id },
      { $pull: { items: { product: product._id } } }
    );

    res.status(200).json({
      success: true,
      message: 'Item moved to cart successfully',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear wishlist
 * DELETE /api/v1/wishlist/clear
 */
export const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlist: [],
        count: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
