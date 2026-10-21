import { Router } from 'express';
import * as teamKitController from '../controllers/teamKit.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All team kit routes require authentication
router.use(requireAuth);

// Admin endpoints (must be defined before /:id to prevent shadowing)
router.get('/admin/all', requireAdmin, teamKitController.getAllRequests);
router.put('/admin/:id/status', requireAdmin, teamKitController.updateRequestStatus);
router.put('/admin/:id/quotation', requireAdmin, teamKitController.recordQuotation);

// Customer endpoints
router.post('/', teamKitController.createRequest);
router.get('/my-requests', teamKitController.getMyRequests);
router.get('/:id', teamKitController.getRequestById);
router.post('/:id/cancel', teamKitController.cancelRequest);

export default router;
