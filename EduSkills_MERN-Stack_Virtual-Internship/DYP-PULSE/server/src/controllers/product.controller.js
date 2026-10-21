import mongoose from 'mongoose';
import Product, { generateSlug } from '../models/Product.js';
import Category from '../models/Category.js';
import InventoryLog from '../models/InventoryLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { updateVariantStock, adjustInventoryStock } from '../services/inventory.service.js';
import { getFallbackProducts, getFallbackProductBySlug } from '../services/catalogFallback.service.js';

/**
 * Helper to resolve category ID from ID, slug, or name
 */
async function resolveCategoryId(categoryIdentifier) {
  if (!categoryIdentifier) return null;
  if (mongoose.Types.ObjectId.isValid(categoryIdentifier)) {
    return categoryIdentifier;
  }
  const cat = await Category.findOne({
    $or: [
      { slug: categoryIdentifier.toLowerCase() },
      { name: new RegExp(`^${categoryIdentifier}$`, 'i') }
    ]
  });
  return cat ? cat._id : null;
}

/**
 * Get products with filtering, search, pagination, and sorting
 * GET /api/v1/products
 */
export const getProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const fallbackResult = getFallbackProducts(req.query);
      return res.status(200).json({
        success: true,
        data: {
          products: fallbackResult.products,
          pagination: fallbackResult.pagination
        }
      });
    }

    const {
      department,
      category,
      subcategory,
      sport,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
      featured,
      newArrivals,
      includeInactive
    } = req.query;

    const filter = {};

    // Only active products for public queries
    if (!includeInactive || !req.user || req.user.role !== 'admin') {
      filter.isActive = true;
    }

    if (department) {
      filter.department = department.toUpperCase();
    }

    if (category) {
      const resolvedCatId = await resolveCategoryId(category);
      if (resolvedCatId) {
        filter.category = resolvedCatId;
      } else {
        // If category identifier was given but doesn't exist, return empty result safely
        return res.status(200).json({
          success: true,
          data: {
            products: [],
            pagination: { total: 0, page: 1, limit: 12, pages: 0, hasNextPage: false, hasPrevPage: false }
          }
        });
      }
    }

    if (subcategory) {
      filter.subcategory = new RegExp(subcategory, 'i');
    }

    if (sport) {
      filter.sport = new RegExp(`^${sport}$`, 'i');
    }

    if (brand) {
      filter.brand = new RegExp(`^${brand}$`, 'i');
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === 'true' || featured === true;
    }

    // Price filtering against integer paise (handles base price and variant overrides)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const minPaise = minPrice !== undefined && !isNaN(Number(minPrice)) ? Math.round(Number(minPrice) * 100) : null;
      const maxPaise = maxPrice !== undefined && !isNaN(Number(maxPrice)) ? Math.round(Number(maxPrice) * 100) : null;

      const basePriceMatch = {};
      const variantPriceMatch = {};

      if (minPaise !== null) {
        basePriceMatch.$gte = minPaise;
        variantPriceMatch.$gte = minPaise;
      }
      if (maxPaise !== null) {
        basePriceMatch.$lte = maxPaise;
        variantPriceMatch.$lte = maxPaise;
      }

      // Product matches if either base price is in range, or any variant override is in range
      const priceOr = [
        { priceInPaise: basePriceMatch },
        { 'variants.priceOverrideInPaise': variantPriceMatch }
      ];

      if (filter.$and) {
        filter.$and.push({ $or: priceOr });
      } else if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: priceOr }];
        delete filter.$or;
      } else {
        filter.$or = priceOr;
      }
    }

    // Size filter (matches sizes array or variants array)
    if (size && size !== 'All Sizes' && size !== 'All') {
      filter.$or = filter.$or || [];
      filter.$or.push({ 'sizes.size': size }, { 'variants.size': size });
    }

    // Color filter (matches colors array or variants array)
    if (color && color !== 'All Colors' && color !== 'All') {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { 'colors.name': new RegExp(`^${color}$`, 'i') },
        { 'variants.color': new RegExp(`^${color}$`, 'i') }
      );
    }

    // Text Search
    if (search && search.trim()) {
      const searchTrim = search.trim();
      const regex = new RegExp(searchTrim, 'i');
      const searchConditions = [
        { name: regex },
        { description: regex },
        { brand: regex },
        { sport: regex },
        { tags: regex }
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOptions = { priceInPaise: 1 };
        break;
      case 'price_desc':
        sortOptions = { priceInPaise: -1 };
        break;
      case 'rating':
        sortOptions = { 'ratings.average': -1, 'ratings.count': -1 };
        break;
      case 'popular':
        sortOptions = { 'ratings.count': -1, createdAt: -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    if (newArrivals) {
      sortOptions = { createdAt: -1 };
    }

    // Safe pagination bounding (max 100 items per request)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug department')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };

    if (req.params.department) {
      responseData.department = req.params.department.toUpperCase();
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by unique slug
 * GET /api/v1/products/:slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug;
    if (!rawSlug) {
      return next(new AppError('Product identifier is required', 400, 'INVALID_SLUG'));
    }

    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
    let product = null;

    // 1. Try finding in MongoDB if database is connected
    if (mongoose.connection.readyState === 1) {
      const activeFilter = (!req.user || req.user.role !== 'admin') ? { isActive: true } : {};

      product = await Product.findOne({ slug: cleanSlug, ...activeFilter })
        .populate('category', 'name slug department');

      if (!product && mongoose.Types.ObjectId.isValid(cleanSlug)) {
        product = await Product.findOne({ _id: cleanSlug, ...activeFilter })
          .populate('category', 'name slug department');
      }
    }

    // 2. If not found in MongoDB (or if running in standalone fallback mode), query in-memory catalog
    if (!product) {
      product = getFallbackProductBySlug(cleanSlug);
    }

    // 3. Return 404 only if product is genuinely missing
    if (!product) {
      return next(new AppError(`Product with slug '${rawSlug}' not found`, 404, 'PRODUCT_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * GET /api/v1/products/featured
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const department = req.query.department ? req.query.department.toUpperCase() : null;

    if (mongoose.connection.readyState !== 1) {
      const fallbackResult = getFallbackProducts({
        featured: true,
        department,
        limit
      });
      return res.status(200).json({
        success: true,
        data: {
          products: fallbackResult.products
        }
      });
    }

    const filter = { isFeatured: true, isActive: true };
    if (department && ['PLAY', 'CAMPUS'].includes(department)) {
      filter.department = department;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug department')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by department (PLAY or CAMPUS)
 * GET /api/v1/products/department/:department
 */
export const getProductsByDepartment = async (req, res, next) => {
  try {
    const department = req.params.department.toUpperCase();

    if (!['PLAY', 'CAMPUS'].includes(department)) {
      return next(new AppError('Invalid department. Must be PLAY or CAMPUS.', 400, 'INVALID_DEPARTMENT'));
    }

    req.query.department = department;
    return getProducts(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (Admin)
 * POST /api/v1/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Resolve category if passed as slug or name
    if (productData.category) {
      const catId = await resolveCategoryId(productData.category);
      if (!catId) {
        return next(new AppError(`Category '${productData.category}' not found`, 400, 'INVALID_CATEGORY'));
      }
      productData.category = catId;
    }

    // Convert price to paise if not already provided
    if (productData.priceInPaise === undefined && productData.price !== undefined) {
      productData.priceInPaise = Math.round(Number(productData.price) * 100);
    }
    if (productData.compareAtPriceInPaise === undefined && productData.compareAtPrice !== undefined) {
      productData.compareAtPriceInPaise = productData.compareAtPrice
        ? Math.round(Number(productData.compareAtPrice) * 100)
        : null;
    }

    // Handle variant price overrides
    if (Array.isArray(productData.variants)) {
      productData.variants = productData.variants.map((v) => {
        if (v.priceOverrideInPaise === undefined && v.priceOverride !== undefined && v.priceOverride !== null) {
          v.priceOverrideInPaise = Math.round(Number(v.priceOverride) * 100);
        }
        return v;
      });

      // Check duplicate SKUs across other products
      const skus = productData.variants.map((v) => v.sku?.trim().toUpperCase()).filter(Boolean);
      const existingWithSku = await Product.findOne({ 'variants.sku': { $in: skus } });
      if (existingWithSku) {
        return next(
          new AppError(
            `One or more variant SKUs already exist in product '${existingWithSku.name}'`,
            409,
            'DUPLICATE_SKU'
          )
        );
      }
    }

    // Generate unique slug
    let baseSlug = generateSlug(productData.name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${count++}`;
    }
    productData.slug = finalSlug;

    const product = new Product(productData);
    await product.save();
    await product.populate('category', 'name slug department');

    res.status(201).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (Admin)
 * PUT /api/v1/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    // Resolve category if updated
    if (updateData.category) {
      const catId = await resolveCategoryId(updateData.category);
      if (!catId) {
        return next(new AppError(`Category '${updateData.category}' not found`, 400, 'INVALID_CATEGORY'));
      }
      updateData.category = catId;
    }

    // Handle price updates
    if (updateData.price !== undefined) {
      updateData.priceInPaise = Math.round(Number(updateData.price) * 100);
    }
    if (updateData.compareAtPrice !== undefined) {
      updateData.compareAtPriceInPaise = updateData.compareAtPrice
        ? Math.round(Number(updateData.compareAtPrice) * 100)
        : null;
    }

    // Slug update if name modified
    if (updateData.name && updateData.name !== product.name) {
      let baseSlug = generateSlug(updateData.name);
      let finalSlug = baseSlug;
      let count = 1;
      while (await Product.findOne({ slug: finalSlug, _id: { $ne: id } })) {
        finalSlug = `${baseSlug}-${count++}`;
      }
      updateData.slug = finalSlug;
    }

    // Check variant SKU uniqueness across other products
    if (Array.isArray(updateData.variants)) {
      const skus = updateData.variants.map((v) => v.sku?.trim().toUpperCase()).filter(Boolean);
      const existingWithSku = await Product.findOne({
        _id: { $ne: id },
        'variants.sku': { $in: skus }
      });
      if (existingWithSku) {
        return next(
          new AppError(
            `One or more variant SKUs already exist in another product '${existingWithSku.name}'`,
            409,
            'DUPLICATE_SKU'
          )
        );
      }
    }

    Object.assign(product, updateData);
    await product.save();
    await product.populate('category', 'name slug department');

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft deactivate product (Admin)
 * DELETE /api/v1/products/:id
 * Preserves historical orders while removing from public catalog
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    // Soft deactivation preserves relational integrity with completed orders
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        message: `Product '${product.name}' was deactivated (soft deleted) to protect historical order records.`,
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle active status (Admin)
 * PATCH /api/v1/products/:id/status
 */
export const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    product.isActive = typeof isActive === 'boolean' ? isActive : !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle featured status (Admin)
 * PATCH /api/v1/products/:id/featured
 */
export const toggleProductFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    product.isFeatured = typeof isFeatured === 'boolean' ? isFeatured : !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new variant to a product (Admin)
 * POST /api/v1/products/:id/variants
 */
export const addVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variantData = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    const upperSku = variantData.sku?.trim().toUpperCase();
    if (!upperSku) {
      return next(new AppError('SKU is required for new variant', 400, 'INVALID_SKU'));
    }

    // Check SKU uniqueness across all products
    const existingWithSku = await Product.findOne({ 'variants.sku': upperSku });
    if (existingWithSku) {
      return next(new AppError(`SKU '${upperSku}' is already in use`, 409, 'DUPLICATE_SKU'));
    }

    if (variantData.priceOverride !== undefined && variantData.priceOverride !== null) {
      variantData.priceOverrideInPaise = Math.round(Number(variantData.priceOverride) * 100);
    }

    variantData.sku = upperSku;
    product.variants.push(variantData);
    await product.save();

    res.status(201).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a variant on a product (Admin)
 * PUT /api/v1/products/:id/variants/:variantId
 */
export const updateVariant = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return next(new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND'));
    }

    if (updateData.sku) {
      const upperSku = updateData.sku.trim().toUpperCase();
      if (upperSku !== variant.sku) {
        const existing = await Product.findOne({
          _id: { $ne: id },
          'variants.sku': upperSku
        });
        if (existing) {
          return next(new AppError(`SKU '${upperSku}' is already in use`, 409, 'DUPLICATE_SKU'));
        }
        updateData.sku = upperSku;
      }
    }

    if (updateData.priceOverride !== undefined) {
      updateData.priceOverrideInPaise =
        updateData.priceOverride === null ? null : Math.round(Number(updateData.priceOverride) * 100);
    }

    Object.assign(variant, updateData);
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a variant from a product (Admin)
 * DELETE /api/v1/products/:id/variants/:variantId
 */
export const deleteVariant = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return next(new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND'));
    }

    variant.deleteOne();
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Variant deleted successfully',
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory for a product or variant (Admin)
 * PATCH /api/v1/products/:id/inventory
 */
export const updateInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variantId, sku, stock, reason = 'Direct stock level update' } = req.body;

    const result = await adjustInventoryStock({
      productId: id,
      variantId,
      sku,
      newStock: stock,
      reason,
      adjustedBy: req.user?._id || null
    });

    res.status(200).json({
      success: true,
      message: `Stock updated to ${result.newStock} units`,
      data: {
        product: result.product,
        log: result.log,
        previousStock: result.previousStock,
        newStock: result.newStock
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Perform authorized stock adjustment with change quantity or new stock (Admin)
 * POST /api/v1/products/admin/inventory/adjust
 */
export const adjustInventory = async (req, res, next) => {
  try {
    const { productId, variantId, sku, changeQuantity, newStock, reason } = req.body;
    const targetProductId = productId || req.params.id;

    if (!targetProductId) {
      return next(new AppError('Product ID is required for stock adjustment', 400, 'PRODUCT_REQUIRED'));
    }

    const result = await adjustInventoryStock({
      productId: targetProductId,
      variantId,
      sku,
      changeQuantity,
      newStock,
      reason: reason || 'Manual stock adjustment',
      adjustedBy: req.user?._id || null
    });

    res.status(200).json({
      success: true,
      message: `Stock successfully adjusted to ${result.newStock} units`,
      data: {
        product: result.product,
        log: result.log,
        previousStock: result.previousStock,
        newStock: result.newStock,
        changeQuantity: result.changeQuantity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve paginated inventory audit logs (Admin)
 * GET /api/v1/products/admin/inventory/logs
 */
export const getInventoryLogs = async (req, res, next) => {
  try {
    const { productId, sku, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (sku) filter.variantSku = sku.trim().toUpperCase();

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      InventoryLog.find(filter)
        .populate('adjustedBy', 'firstName lastName email role')
        .populate('product', 'name slug department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      InventoryLog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        logs,
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
 * Get search suggestions as user types (FEATURE 6)
 * GET /api/v1/products/search/suggestions?q=...
 */
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          categories: [],
          sports: [],
          brands: [],
          query: ''
        }
      });
    }

    const cleanQuery = q.trim();
    const regex = new RegExp(cleanQuery, 'i');

    const [products, allMatches] = await Promise.all([
      // Top 6 product suggestions with minimal fields
      Product.find({
        isActive: true,
        $or: [
          { name: regex },
          { brand: regex },
          { sport: regex },
          { tags: regex },
          { subcategory: regex }
        ]
      })
        .select('_id name slug priceInPaise department images category brand sport')
        .populate('category', 'name slug')
        .limit(6),

      // Broader scan for categories, sports, and brands suggestions
      Product.find(
        {
          isActive: true,
          $or: [{ name: regex }, { brand: regex }, { sport: regex }, { tags: regex }]
        },
        'brand sport department'
      ).limit(50)
    ]);

    // Aggregate distinct matching brands
    const matchingBrands = [
      ...new Set(
        allMatches
          .map((p) => p.brand)
          .filter((b) => b && regex.test(b))
      )
    ].slice(0, 4);

    // Aggregate distinct matching sports
    const matchingSports = [
      ...new Set(
        allMatches
          .map((p) => p.sport)
          .filter((s) => s && regex.test(s))
      )
    ].slice(0, 4);

    // Search Category collection for matching categories
    const matchingCategories = await Category.find({
      name: regex,
      isActive: true
    })
      .select('name slug department')
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        products,
        categories: matchingCategories,
        sports: matchingSports,
        brands: matchingBrands,
        query: cleanQuery
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get explainable product recommendations (FEATURE 4)
 * GET /api/v1/products/:id/recommendations
 */
export const getProductRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Anchor product lookup
    let anchorProduct;
    if (mongoose.Types.ObjectId.isValid(id)) {
      anchorProduct = await Product.findById(id).populate('category');
    } else {
      anchorProduct = await Product.findOne({ slug: id.toLowerCase() }).populate('category');
    }

    if (!anchorProduct) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    const anchorId = anchorProduct._id;
    const recommendations = [];
    const seenIds = new Set([anchorId.toString()]);

    // 1. Complementary product mapping based on discipline/category
    const sportLower = (anchorProduct.sport || '').toLowerCase();
    const nameLower = anchorProduct.name.toLowerCase();

    let complementaryKeywords = [];
    if (sportLower.includes('cricket') || nameLower.includes('cricket')) {
      complementaryKeywords = ['gloves', 'pads', 'ball', 'bat', 'helmet', 'socks'];
    } else if (sportLower.includes('football') || nameLower.includes('football')) {
      complementaryKeywords = ['boots', 'shin', 'guards', 'socks', 'jersey'];
    } else if (sportLower.includes('basketball') || nameLower.includes('basketball')) {
      complementaryKeywords = ['shoes', 'shorts', 'sleeve', 'headband', 'socks'];
    } else if (sportLower.includes('badminton') || nameLower.includes('badminton')) {
      complementaryKeywords = ['shuttlecock', 'grip', 'wristband', 'shoes'];
    } else if (nameLower.includes('shoe') || nameLower.includes('sneaker')) {
      complementaryKeywords = ['socks', 'crease', 'laces', 'joggers'];
    } else if (nameLower.includes('backpack') || nameLower.includes('bag')) {
      complementaryKeywords = ['bottle', 'stationery', 'notebook', 'case'];
    } else if (nameLower.includes('hoodie') || nameLower.includes('sweatshirt')) {
      complementaryKeywords = ['joggers', 'sneakers', 'tee', 'cap', 'socks'];
    }

    if (complementaryKeywords.length > 0) {
      const compRegex = new RegExp(complementaryKeywords.join('|'), 'i');
      const complementaryMatches = await Product.find({
        _id: { $ne: anchorId },
        isActive: true,
        $or: [{ name: compRegex }, { tags: compRegex }, { subcategory: compRegex }]
      })
        .populate('category', 'name slug')
        .limit(4);

      for (const p of complementaryMatches) {
        if (!seenIds.has(p._id.toString())) {
          seenIds.add(p._id.toString());
          const pObj = p.toObject({ virtuals: true });
          pObj.recommendationReason = `Complementary Gear: Pairs well with ${anchorProduct.name.split(' ').slice(0, 3).join(' ')}`;
          recommendations.push(pObj);
        }
      }
    }

    // 2. Same sport products (if sport is defined)
    if (anchorProduct.sport && recommendations.length < 6) {
      const sameSport = await Product.find({
        _id: { $nin: Array.from(seenIds) },
        sport: new RegExp(`^${anchorProduct.sport}$`, 'i'),
        isActive: true
      })
        .populate('category', 'name slug')
        .limit(4);

      for (const p of sameSport) {
        if (!seenIds.has(p._id.toString())) {
          seenIds.add(p._id.toString());
          const pObj = p.toObject({ virtuals: true });
          pObj.recommendationReason = `Same Sport: More ${anchorProduct.sport} Essentials`;
          recommendations.push(pObj);
        }
      }
    }

    // 3. Same category products
    if (anchorProduct.category && recommendations.length < 6) {
      const sameCategory = await Product.find({
        _id: { $nin: Array.from(seenIds) },
        category: anchorProduct.category._id || anchorProduct.category,
        isActive: true
      })
        .populate('category', 'name slug')
        .limit(4);

      for (const p of sameCategory) {
        if (!seenIds.has(p._id.toString())) {
          seenIds.add(p._id.toString());
          const pObj = p.toObject({ virtuals: true });
          pObj.recommendationReason = `Similar in ${anchorProduct.category?.name || 'Category'}`;
          recommendations.push(pObj);
        }
      }
    }

    // 4. Same department products
    if (recommendations.length < 6) {
      const sameDept = await Product.find({
        _id: { $nin: Array.from(seenIds) },
        department: anchorProduct.department,
        isActive: true
      })
        .populate('category', 'name slug')
        .limit(6 - recommendations.length);

      for (const p of sameDept) {
        if (!seenIds.has(p._id.toString())) {
          seenIds.add(p._id.toString());
          const pObj = p.toObject({ virtuals: true });
          pObj.recommendationReason = `Trending in DYPULSE ${anchorProduct.department}`;
          recommendations.push(pObj);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        anchorProduct: {
          _id: anchorProduct._id,
          name: anchorProduct.name,
          slug: anchorProduct.slug,
          department: anchorProduct.department,
          sport: anchorProduct.sport
        },
        recommendations: recommendations.slice(0, 6)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record recently viewed product (FEATURE 5)
 * POST /api/v1/products/:id/recently-viewed
 */
export const recordRecentlyViewed = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = mongoose.Types.ObjectId.isValid(id)
      ? await Product.findById(id)
      : await Product.findOne({ slug: id.toLowerCase() });

    if (!product || !product.isActive) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    // If authenticated, persist to user document
    if (req.user) {
      const User = mongoose.model('User');
      const user = await User.findById(req.user._id);

      if (user) {
        user.recentlyViewed = user.recentlyViewed || [];

        // Remove existing entry for same product if present
        user.recentlyViewed = user.recentlyViewed.filter(
          (rv) => rv.product && rv.product.toString() !== product._id.toString()
        );

        // Prepend new view
        user.recentlyViewed.unshift({
          product: product._id,
          viewedAt: new Date()
        });

        // Limit to 20 items
        if (user.recentlyViewed.length > 20) {
          user.recentlyViewed = user.recentlyViewed.slice(0, 20);
        }

        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product view recorded'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recently viewed products (FEATURE 5)
 * Supports authenticated history and guest fallback via ?ids=id1,id2
 * GET /api/v1/products/recently-viewed
 */
export const getRecentlyViewedProducts = async (req, res, next) => {
  try {
    let productIds = [];

    if (req.user) {
      const User = mongoose.model('User');
      const user = await User.findById(req.user._id);
      if (user && user.recentlyViewed && user.recentlyViewed.length > 0) {
        productIds = user.recentlyViewed.map((rv) => rv.product).filter(Boolean);
      }
    }

    // Guest fallback via query param
    if (productIds.length === 0 && req.query.ids) {
      const rawIds = String(req.query.ids).split(',').map((s) => s.trim()).filter(Boolean);
      productIds = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    }

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          products: []
        }
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    }).populate('category', 'name slug');

    // Retain viewed order
    const orderedProducts = [];
    for (const id of productIds) {
      const match = products.find((p) => p._id.toString() === id.toString());
      if (match && !orderedProducts.some((p) => p._id.toString() === match._id.toString())) {
        orderedProducts.push(match);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        products: orderedProducts.slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

