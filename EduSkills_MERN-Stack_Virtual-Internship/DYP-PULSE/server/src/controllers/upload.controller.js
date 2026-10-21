import { uploadImage, uploadMultipleImages } from '../services/upload.service.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Upload single image (Admin)
 * POST /api/v1/uploads
 */
export const handleSingleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file uploaded', 400, 'NO_FILE_UPLOADED'));
    }

    const { alt } = req.body;
    const imageMetadata = await uploadImage(req.file, alt);

    res.status(201).json({
      success: true,
      data: {
        image: imageMetadata
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple images (Admin)
 * POST /api/v1/uploads/multiple
 */
export const handleMultipleUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No image files uploaded', 400, 'NO_FILES_UPLOADED'));
    }

    const { altPrefix } = req.body;
    const images = await uploadMultipleImages(req.files, altPrefix);

    res.status(201).json({
      success: true,
      data: {
        images
      }
    });
  } catch (error) {
    next(error);
  }
};
