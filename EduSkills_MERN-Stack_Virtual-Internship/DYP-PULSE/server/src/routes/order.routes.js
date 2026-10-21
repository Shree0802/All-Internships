import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All order routes require authentication
router.use(requireAuth);

router.post('/calculate-summary', orderController.calculateCheckoutSummary);
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/all', requireAdmin, orderController.getAllOrders);
router.get('/admin/analytics', requireAdmin, orderController.getAdminAnalytics);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

export default router;
