import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Submit review for a product with purchase eligibility check
 * POST /api/v1/products/:productId/reviews
 */
export const submitReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title = '', reviewText } = req.body;

    // Validate product existence
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not found or inactive', 404, 'PRODUCT_NOT_FOUND'));
    }

    // Rating validation
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return next(new AppError('Rating must be an integer between 1 and 5 stars', 400, 'INVALID_RATING'));
    }

    if (!reviewText || reviewText.trim().length < 5) {
      return next(new AppError('Review text must be at least 5 characters', 400, 'INVALID_REVIEW_TEXT'));
    }

    // Policy: Find an eligible completed purchase (delivered order) containing this product
    const eligibleOrder = await Order.findOne({
      user: req.user._id,
      $or: [{ orderStatus: 'delivered' }, { status: 'delivered' }],
      'items.product': product._id
    }).sort({ createdAt: -1 });

    if (!eligibleOrder) {
      return next(
        new AppError(
          'Review eligibility policy: Only customers with a verified, delivered purchase of this product can submit a review.',
          403,
          'REVIEW_ELIGIBILITY_REQUIRED'
        )
      );
    }

    // Check duplicate review for the same eligible purchase item
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: product._id,
      order: eligibleOrder._id
    });

    if (existingReview) {
      return next(
        new AppError(
          'You have already submitted a review for this delivered purchase item.',
          400,
          'DUPLICATE_REVIEW'
        )
      );
    }

    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      order: eligibleOrder._id,
      rating: numRating,
      title: title.trim(),
      reviewText: reviewText.trim(),
      moderationStatus: 'approved',
      verifiedPurchase: true
    });

    // Recalculate product aggregate ratings
    const updatedStats = await Review.updateProductRatingStats(product._id);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'firstName lastName avatar email');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: populatedReview,
        productRatingStats: updatedStats
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new AppError(
          'You have already submitted a review for this delivered purchase item.',
          400,
          'DUPLICATE_REVIEW'
        )
      );
    }
    next(error);
  }
};

/**
 * Get approved reviews for a product
 * GET /api/v1/products/:productId/reviews
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      product: productId,
      moderationStatus: 'approved'
    };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        reviews,
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
 * Edit a permitted review
 * PUT /api/v1/reviews/:id
 */
export const editReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, reviewText } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError('Review not found', 404, 'REVIEW_NOT_FOUND'));
    }

    // Ownership check
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to edit this review', 403, 'FORBIDDEN'));
    }

    if (rating !== undefined) {
      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return next(new AppError('Rating must be an integer between 1 and 5 stars', 400, 'INVALID_RATING'));
      }
      review.rating = numRating;
    }

    if (title !== undefined) {
      review.title = title.trim();
    }

    if (reviewText !== undefined) {
      if (reviewText.trim().length < 5) {
        return next(new AppError('Review text must be at least 5 characters', 400, 'INVALID_REVIEW_TEXT'));
      }
      review.reviewText = reviewText.trim();
    }

    await review.save();

    // Recalculate stats
    const updatedStats = await Review.updateProductRatingStats(review.product);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review,
        productRatingStats: updatedStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all reviews for moderation
 * GET /api/v1/reviews/admin/all
 */
export const adminGetAllReviews = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'ALL') {
      filter.moderationStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('product', 'name slug department priceInPaise images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Moderate review status (approve or reject)
 * PUT /api/v1/reviews/admin/:id/status
 */
export const adminModerateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { moderationStatus } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(moderationStatus)) {
      return next(new AppError('Invalid moderation status', 400, 'INVALID_MODERATION_STATUS'));
    }

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError('Review not found', 404, 'REVIEW_NOT_FOUND'));
    }

    review.moderationStatus = moderationStatus;
    await review.save();

    // Recalculate stats on product
    const updatedStats = await Review.updateProductRatingStats(review.product);

    res.status(200).json({
      success: true,
      message: `Review moderation status updated to ${moderationStatus}`,
      data: {
        review,
        productRatingStats: updatedStats
      }
    });
  } catch (error) {
    next(error);
  }
};
