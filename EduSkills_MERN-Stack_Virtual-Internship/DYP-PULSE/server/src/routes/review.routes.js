import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin review endpoints
router.get('/admin/all', requireAuth, requireAdmin, reviewController.adminGetAllReviews);
router.put('/admin/:id/status', requireAuth, requireAdmin, reviewController.adminModerateReview);
router.put('/admin/:id/moderate', requireAuth, requireAdmin, reviewController.adminModerateReview);

// Customer review endpoints
router.put('/:id', requireAuth, reviewController.editReview);

export default router;
