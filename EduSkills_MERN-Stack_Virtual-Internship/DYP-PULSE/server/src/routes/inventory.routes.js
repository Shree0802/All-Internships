import { Router } from 'express';
import { adjustInventory, getInventoryLogs } from '../controllers/product.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin-only inventory adjustment and audit logging routes
router.post('/adjust', requireAuth, requireAdmin, adjustInventory);
router.get('/logs', requireAuth, requireAdmin, getInventoryLogs);

export default router;
