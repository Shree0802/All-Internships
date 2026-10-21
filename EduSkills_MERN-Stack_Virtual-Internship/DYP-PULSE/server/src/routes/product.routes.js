import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  variantInputSchema,
  inventoryUpdateSchema
} from '../validators/product.validator.js';

import * as reviewController from '../controllers/review.controller.js';

const router = Router();

// Admin-only dedicated inventory adjustment & audit routes (must precede /:slug)
router.post(
  '/admin/inventory/adjust',
  requireAuth,
  requireAdmin,
  productController.adjustInventory
);
router.get(
  '/admin/inventory/logs',
  requireAuth,
  requireAdmin,
  productController.getInventoryLogs
);

// Specialized public product query endpoints (must precede /:slug)
router.get('/search/suggestions', productController.getSearchSuggestions);
router.get('/recently-viewed', optionalAuth, productController.getRecentlyViewedProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/department/:department', productController.getProductsByDepartment);

// Reviews & recommendations per product
router.get('/:id/recommendations', productController.getProductRecommendations);
router.post('/:id/recently-viewed', optionalAuth, productController.recordRecentlyViewed);
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', requireAuth, reviewController.submitReview);

// Standard catalog query & product detail by slug
router.get('/', validate(productQuerySchema, 'query'), productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:slug', productController.getProductBySlug);

// Admin-only product management routes
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  productController.deleteProduct
);

// Admin-only status, featured & inventory endpoints
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  productController.toggleProductStatus
);

router.patch(
  '/:id/featured',
  requireAuth,
  requireAdmin,
  productController.toggleProductFeatured
);

router.patch(
  '/:id/inventory',
  requireAuth,
  requireAdmin,
  validate(inventoryUpdateSchema),
  productController.updateInventory
);

// Admin-only variant management endpoints
router.post(
  '/:id/variants',
  requireAuth,
  requireAdmin,
  validate(variantInputSchema),
  productController.addVariant
);

router.put(
  '/:id/variants/:variantId',
  requireAuth,
  requireAdmin,
  validate(variantInputSchema.partial()),
  productController.updateVariant
);

router.delete(
  '/:id/variants/:variantId',
  requireAuth,
  requireAdmin,
  productController.deleteVariant
);

export default router;
