import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Validate coupon code against subtotal or user cart
 * POST /api/v1/coupons/validate
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const {
      code,
      subtotalInPaise: clientSubtotal,
      department,
      departments,
      items
    } = req.body;

    if (!code) {
      return next(new AppError('Coupon code is required', 400, 'MISSING_COUPON_CODE'));
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return next(new AppError(`Coupon '${cleanCode}' is invalid`, 404, 'COUPON_NOT_FOUND'));
    }

    // Determine subtotal from user cart if available, else from validated parameter
    let subtotalInPaise = clientSubtotal;

    if (subtotalInPaise == null && req.user) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        subtotalInPaise = cart.subtotalInPaise;
      }
    }

    if (subtotalInPaise == null) {
      subtotalInPaise = 0;
    }

    const deptToCheck =
      department || (Array.isArray(departments) && departments.length === 1 ? departments[0] : null);

    const check = coupon.isValidForOrder(subtotalInPaise, deptToCheck, items);
    if (!check.valid) {
      return next(new AppError(check.message, 400, 'COUPON_NOT_APPLICABLE'));
    }

    if (req.user && coupon.perUserLimit) {
      const userCheck = await coupon.isValidForUserAndOrder(req.user._id, subtotalInPaise, {
        department: deptToCheck,
        items
      });
      if (!userCheck.valid) {
        return next(new AppError(userCheck.message, 400, 'COUPON_NOT_APPLICABLE'));
      }
    }

    const discountInPaise = coupon.calculateDiscountInPaise(subtotalInPaise);

    res.status(200).json({
      success: true,
      message: `Coupon '${cleanCode}' applied successfully!`,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountInPaise,
        discount: discountInPaise / 100,
        subtotalInPaise,
        subtotal: subtotalInPaise / 100,
        finalTotalInPaise: Math.max(0, subtotalInPaise - discountInPaise),
        finalTotal: Math.max(0, subtotalInPaise - discountInPaise) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all coupons (Admin)
 * GET /api/v1/coupons
 */
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        coupons,
        count: coupons.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create coupon (Admin)
 * POST /api/v1/coupons
 */
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      minOrderAmountInPaise,
      maxDiscount,
      maxDiscountInPaise,
      expiresAt,
      startDate,
      usageLimit,
      perUserLimit,
      eligibleDepartments,
      applicableDepartment
    } = req.body;

    if (!code || !discountType || discountValue == null || !expiresAt) {
      return next(
        new AppError(
          'Code, discountType, discountValue, and expiresAt are required',
          400,
          'MISSING_REQUIRED_FIELDS'
        )
      );
    }

    const minAmountPaise =
      minOrderAmountInPaise != null
        ? parseInt(minOrderAmountInPaise, 10)
        : minOrderAmount != null
        ? Math.round(minOrderAmount * 100)
        : 0;

    const maxDiscPaise =
      maxDiscountInPaise != null
        ? parseInt(maxDiscountInPaise, 10)
        : maxDiscount != null
        ? Math.round(maxDiscount * 100)
        : null;

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmountInPaise: minAmountPaise,
      maxDiscountInPaise: maxDiscPaise,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiresAt: new Date(expiresAt),
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : 1000,
      perUserLimit: perUserLimit != null && perUserLimit !== '' ? parseInt(perUserLimit, 10) : null,
      eligibleDepartments: Array.isArray(eligibleDepartments)
        ? eligibleDepartments
        : applicableDepartment && applicableDepartment !== 'ALL'
        ? [applicableDepartment]
        : [],
      applicableDepartment: applicableDepartment || 'ALL'
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('A coupon with this code already exists', 409, 'DUPLICATE_COUPON'));
    }
    next(error);
  }
};

/**
 * Update coupon (Admin)
 * PUT /api/v1/coupons/:id
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    if (updateData.minOrderAmount != null) {
      updateData.minOrderAmountInPaise = Math.round(updateData.minOrderAmount * 100);
      delete updateData.minOrderAmount;
    }
    if (updateData.maxDiscount != null) {
      updateData.maxDiscountInPaise = Math.round(updateData.maxDiscount * 100);
      delete updateData.maxDiscount;
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      return next(new AppError('Coupon not found', 404, 'COUPON_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle / delete coupon (Admin)
 * DELETE /api/v1/coupons/:id
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return next(new AppError('Coupon not found', 404, 'COUPON_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
