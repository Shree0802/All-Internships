import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public payment gateway configuration
router.get('/config', paymentController.getPaymentConfig);

// Webhook endpoint (Public, signature-verified)
router.post('/webhook', paymentController.handleWebhook);

// Authenticated payment operations
router.post('/create-order', requireAuth, paymentController.createPaymentOrder);
router.post('/verify', requireAuth, paymentController.verifyPayment);
router.post('/record-failure', requireAuth, paymentController.recordPaymentFailure);
router.post('/switch-method/:id', requireAuth, paymentController.switchPaymentMethod);

export default router;
