import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All cart operations require authenticated user session
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/sync', cartController.syncGuestCart);
router.post('/merge', cartController.syncGuestCart);
router.post('/coupon', cartController.applyCouponToCart);
router.delete('/coupon', cartController.removeCouponFromCart);
router.put('/update', cartController.updateCartItem);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/clear', cartController.clearCart);
router.delete('/remove/:itemId', cartController.removeCartItem);
router.delete('/:itemId', cartController.removeCartItem);

export default router;
