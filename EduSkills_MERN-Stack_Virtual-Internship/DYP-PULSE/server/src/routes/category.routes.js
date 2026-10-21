import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCategorySchema,
  updateCategorySchema
} from '../validators/category.validator.js';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin-only routes
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  categoryController.deleteCategory
);

export default router;
