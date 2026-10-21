import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = Router();

// Admin-only upload endpoints
router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  uploadController.handleSingleUpload
);

router.post(
  '/multiple',
  requireAuth,
  requireAdmin,
  upload.array('images', 8),
  uploadController.handleMultipleUpload
);

export default router;
