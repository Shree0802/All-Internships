import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Validates that a variant belongs to a product and returns the variant
 */
export const getProductVariant = async (productId, variantIdOrSku) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const variant = product.variants.find(
    (v) =>
      v._id.toString() === variantIdOrSku.toString() ||
      (v.sku && v.sku.toUpperCase() === variantIdOrSku.toString().toUpperCase())
  );

  if (!variant) {
    throw new AppError(
      `Variant '${variantIdOrSku}' does not belong to product '${product.name}'`,
      400,
      'INVALID_VARIANT'
    );
  }

  return { product, variant };
};

/**
 * Check if a product or variant has sufficient available stock
 */
export const checkStockAvailability = async (productId, variantIdOrSku, requestedQuantity = 1) => {
  if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
    throw new AppError('Requested quantity must be a positive integer', 400, 'INVALID_QUANTITY');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product is inactive or not found', 404, 'PRODUCT_UNAVAILABLE');
  }

  // If specific variant requested
  if (variantIdOrSku) {
    const variant = product.variants.find(
      (v) =>
        v._id.toString() === variantIdOrSku.toString() ||
        (v.sku && v.sku.toUpperCase() === variantIdOrSku.toString().toUpperCase())
    );

    if (!variant) {
      throw new AppError('Specified product variant not found', 400, 'VARIANT_NOT_FOUND');
    }

    if (variant.stock < requestedQuantity) {
      return {
        available: false,
        stock: variant.stock,
        message: `Insufficient stock for SKU ${variant.sku}. Only ${variant.stock} units available.`
      };
    }

    return {
      available: true,
      stock: variant.stock,
      variant
    };
  }

  // Fallback to top-level stock
  if (product.stock < requestedQuantity) {
    return {
      available: false,
      stock: product.stock,
      message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.`
    };
  }

  return {
    available: true,
    stock: product.stock
  };
};

/**
 * Atomically reserve inventory during order placement
 */
export const reserveStockAtomic = async (productId, sku, quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError('Quantity to reserve must be a positive integer', 400, 'INVALID_QUANTITY');
  }

  if (sku) {
    const upperSku = sku.trim().toUpperCase();
    const updated = await Product.findOneAndUpdate(
      {
        _id: productId,
        'variants.sku': upperSku,
        'variants.stock': { $gte: quantity }
      },
      {
        $inc: {
          'variants.$.stock': -quantity,
          stock: -quantity
        }
      },
      { new: true }
    );

    if (!updated) {
      throw new AppError(
        `Failed to reserve stock for SKU ${sku}: insufficient quantity available`,
        409,
        'STOCK_RESERVATION_FAILED'
      );
    }

    return updated;
  }

  // Top-level product stock reservation
  const updated = await Product.findOneAndUpdate(
    {
      _id: productId,
      stock: { $gte: quantity }
    },
    {
      $inc: { stock: -quantity }
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError(
      'Failed to reserve product stock: insufficient quantity available',
      409,
      'STOCK_RESERVATION_FAILED'
    );
  }

  return updated;
};

/**
 * Atomically reserve stock for an item with SKU, size, or color
 */
export const reserveProductItemStock = async (productId, { sku, size, color }, quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError('Quantity must be a positive integer', 400, 'INVALID_QUANTITY');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not available or active', 404, 'PRODUCT_UNAVAILABLE');
  }

  // Find variant by SKU or size/color
  let targetSku = sku ? sku.trim().toUpperCase() : null;
  if (product.variants && product.variants.length > 0) {
    if (targetSku) {
      const exists = product.variants.some((v) => v.sku && v.sku.toUpperCase() === targetSku);
      if (!exists) {
        throw new AppError(
          `Variant SKU '${targetSku}' does not exist on product '${product.name}'`,
          400,
          'VARIANT_MISMATCH'
        );
      }
    } else {
      const matched = product.variants.find(
        (v) => (!size || v.size === size) && (!color || v.color === color)
      );
      if (!matched) {
        throw new AppError(
          `Variant specification (size: ${size || 'any'}, color: ${color || 'any'}) does not match any valid variant of '${product.name}'`,
          400,
          'VARIANT_MISMATCH'
        );
      }
      targetSku = matched.sku;
    }
  }

  return reserveStockAtomic(productId, targetSku, quantity);
};

/**
 * Atomically release stock back into inventory (e.g., cancelled order or rollback)
 */
export const releaseStockAtomic = async (productId, sku, quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError('Quantity to release must be a positive integer', 400, 'INVALID_QUANTITY');
  }

  if (sku) {
    const upperSku = sku.trim().toUpperCase();
    return Product.findOneAndUpdate(
      {
        _id: productId,
        'variants.sku': upperSku
      },
      {
        $inc: {
          'variants.$.stock': quantity,
          stock: quantity
        }
      },
      { new: true }
    );
  }

  return Product.findOneAndUpdate(
    { _id: productId },
    { $inc: { stock: quantity } },
    { new: true }
  );
};

/**
 * Atomically release stock for an item with SKU, size, or color
 */
export const releaseProductItemStock = async (productId, { sku, size, color }, quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError('Quantity must be a positive integer', 400, 'INVALID_QUANTITY');
  }

  const product = await Product.findById(productId);
  if (!product) return null;

  let targetSku = sku ? sku.trim().toUpperCase() : null;
  if (!targetSku && product.variants && product.variants.length > 0) {
    const matched = product.variants.find(
      (v) => (!size || v.size === size) && (!color || v.color === color)
    );
    if (matched) {
      targetSku = matched.sku;
    }
  }

  return releaseStockAtomic(productId, targetSku, quantity);
};

/**
 * Update stock count for a variant
 */
export const updateVariantStock = async (productId, variantId, newStock) => {
  if (!Number.isInteger(newStock) || newStock < 0) {
    throw new AppError('Stock quantity must be a non-negative integer', 400, 'INVALID_STOCK');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    throw new AppError('Variant not found on product', 404, 'VARIANT_NOT_FOUND');
  }

  variant.stock = newStock;
  // product pre-validate hook will recompute product.stock automatically
  await product.save();

  return product;
};

/**
 * Query products with low stock variants
 */
export const getLowStockProducts = async (threshold = 5) => {
  return Product.find({
    isActive: true,
    $or: [
      { stock: { $lte: threshold } },
      { 'variants.stock': { $lte: threshold } }
    ]
  }).populate('category', 'name slug department');
};

/**
 * Perform authorized stock adjustment with strict negative stock prevention & audit logging
 */
export const adjustInventoryStock = async ({
  productId,
  variantId,
  sku,
  changeQuantity,
  newStock,
  reason = 'Manual admin stock adjustment',
  adjustedBy = null
}) => {
  if (!productId) {
    throw new AppError('Product ID is required for stock adjustment', 400, 'PRODUCT_REQUIRED');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  let targetVariant = null;
  if (variantId || sku) {
    targetVariant = product.variants.find(
      (v) =>
        (variantId && v._id.toString() === variantId.toString()) ||
        (sku && v.sku.toUpperCase() === sku.toString().toUpperCase())
    );
    if (!targetVariant) {
      throw new AppError('Specified variant was not found on product', 404, 'VARIANT_NOT_FOUND');
    }
  }

  const previousStock = targetVariant ? targetVariant.stock : product.stock;
  let computedNewStock;

  if (newStock !== undefined && newStock !== null) {
    const parsedNewStock = Number(newStock);
    if (!Number.isInteger(parsedNewStock) || parsedNewStock < 0) {
      throw new AppError('New stock must be a non-negative integer', 400, 'INVALID_STOCK');
    }
    computedNewStock = parsedNewStock;
  } else if (changeQuantity !== undefined && changeQuantity !== null) {
    const parsedChange = Number(changeQuantity);
    if (!Number.isInteger(parsedChange)) {
      throw new AppError('changeQuantity must be an integer', 400, 'INVALID_QUANTITY');
    }
    computedNewStock = previousStock + parsedChange;
  } else {
    throw new AppError('Either newStock or changeQuantity must be provided', 400, 'MISSING_ADJUSTMENT_VALUE');
  }

  if (computedNewStock < 0) {
    throw new AppError(
      `Stock adjustment would result in negative inventory (${computedNewStock}). Current stock is ${previousStock}.`,
      400,
      'NEGATIVE_STOCK_DISALLOWED'
    );
  }

  const actualChangeQty = computedNewStock - previousStock;

  if (targetVariant) {
    targetVariant.stock = computedNewStock;
  } else {
    product.stock = computedNewStock;
  }

  await product.save();

  const log = await InventoryLog.create({
    product: product._id,
    productName: product.name,
    variantSku: targetVariant ? targetVariant.sku : '',
    variantDetails: targetVariant ? { size: targetVariant.size, color: targetVariant.color } : {},
    changeType: 'manual_adjustment',
    changeQuantity: actualChangeQty,
    previousStock,
    newStock: computedNewStock,
    reason: reason.trim() || 'Manual stock adjustment',
    adjustedBy
  });

  return {
    product,
    log,
    previousStock,
    newStock: computedNewStock,
    changeQuantity: actualChangeQty
  };
};

