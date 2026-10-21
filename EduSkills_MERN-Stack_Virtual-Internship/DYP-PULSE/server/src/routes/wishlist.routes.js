import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.post('/move-to-cart/:productId', wishlistController.moveToCart);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
