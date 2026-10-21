import mongoose from 'mongoose';
import Category, { generateCategorySlug } from '../models/Category.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { getFallbackCategories } from '../services/catalogFallback.service.js';

/**
 * Get all categories with optional department filtering
 * GET /api/v1/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const { department, includeInactive } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const categories = getFallbackCategories(department);
      return res.status(200).json({
        success: true,
        data: {
          categories
        }
      });
    }
    const filter = {};

    // For public requests, only active categories are visible
    if (!includeInactive || !req.user || req.user.role !== 'admin') {
      filter.isActive = true;
    }

    if (department && ['PLAY', 'CAMPUS'].includes(department.toUpperCase())) {
      filter.department = department.toUpperCase();
    }

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category by slug
 * GET /api/v1/categories/:slug
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const all = getFallbackCategories();
      const cat = all.find((c) => c.slug === slug.toLowerCase());
      if (!cat) {
        return next(
          new AppError(`Category with slug '${slug}' was not found`, 404, 'CATEGORY_NOT_FOUND')
        );
      }
      return res.status(200).json({
        success: true,
        data: {
          category: cat,
          subcategories: []
        }
      });
    }

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
      isActive: true
    }).populate('parent', 'name slug department');

    if (!category) {
      return next(
        new AppError(`Category with slug '${slug}' was not found`, 404, 'CATEGORY_NOT_FOUND')
      );
    }

    // Also fetch child categories (subcategories) if any
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        category,
        subcategories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category (Admin)
 * POST /api/v1/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, department, description = '', parent = null, image = '', isActive = true } = req.body;

    let baseSlug = generateCategorySlug(name);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const category = new Category({
      name,
      slug: finalSlug,
      department: department.toUpperCase(),
      description,
      parent: parent || null,
      image,
      isActive
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (Admin)
 * PUT /api/v1/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    if (updateData.name && updateData.name !== category.name) {
      let baseSlug = generateCategorySlug(updateData.name);
      let finalSlug = baseSlug;
      let counter = 1;
      while (await Category.findOne({ slug: finalSlug, _id: { $ne: id } })) {
        finalSlug = `${baseSlug}-${counter++}`;
      }
      updateData.slug = finalSlug;
    }

    if (updateData.department) {
      updateData.department = updateData.department.toUpperCase();
    }

    Object.assign(category, updateData);
    await category.save();

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft deactivate or delete category (Admin)
 * DELETE /api/v1/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    // Check if products are actively linked to this category
    const linkedProductCount = await Product.countDocuments({
      category: id,
      isActive: true
    });

    if (linkedProductCount > 0) {
      // Soft-deactivate to prevent breaking catalog integrity
      category.isActive = false;
      await category.save();

      return res.status(200).json({
        success: true,
        data: {
          message: `Category deactivated (soft) because ${linkedProductCount} active product(s) reference it.`,
          category
        }
      });
    }

    // If no products reference it, safe to delete
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {
        message: 'Category deleted successfully',
        id
      }
    });
  } catch (error) {
    next(error);
  }
};
