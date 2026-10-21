import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public coupon validation endpoint (allows checking coupons before checkout)
router.post('/validate', optionalAuth, couponController.validateCoupon);

// Admin-only management routes
router.use(requireAuth, requireAdmin);
router.get('/', couponController.getCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
