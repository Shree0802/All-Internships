import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

const isCloudinaryConfigured = () => {
  return (
    Boolean(config.cloudinary.cloudName) &&
    Boolean(config.cloudinary.apiKey) &&
    Boolean(config.cloudinary.apiSecret)
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
}

const ensureLocalUploadDir = () => {
  const dir = path.resolve('public', 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Upload single image buffer to Cloudinary or local disk fallback
 * @param {Object} file - Express multer file object
 * @param {string} [altText] - Description of image
 */
export const uploadImage = async (file, altText = '') => {
  if (!file || !file.buffer) {
    throw new AppError('No image file buffer provided for upload', 400, 'NO_FILE_PROVIDED');
  }

  // Cloudinary Production Upload
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'dypulse/products',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(`Cloudinary upload failed: ${error.message}`, 502, 'CLOUDINARY_ERROR')
            );
          }
          resolve({
            url: result.secure_url || result.url,
            publicId: result.public_id,
            alt: altText || file.originalname || 'Product Image',
            format: result.format,
            bytes: result.bytes,
            provider: 'cloudinary'
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // Local Disk Storage Development Fallback
  const uploadDir = ensureLocalUploadDir();
  const ext = path.extname(file.originalname) || '.jpg';
  const randomHash = crypto.randomBytes(12).toString('hex');
  const filename = `prod-${Date.now()}-${randomHash}${ext}`;
  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: `local_${filename}`,
    alt: altText || file.originalname || 'Product Image',
    format: ext.replace('.', ''),
    bytes: file.size,
    provider: 'local_disk'
  };
};

/**
 * Upload multiple image buffers
 */
export const uploadMultipleImages = async (files, altPrefix = '') => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError('No files uploaded', 400, 'NO_FILES_UPLOADED');
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const alt = altPrefix ? `${altPrefix} - Angle ${i + 1}` : file.originalname;
    const metadata = await uploadImage(file, alt);
    results.push(metadata);
  }
  return results;
};

/**
 * Delete image from Cloudinary or local disk
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;

  if (publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const filePath = path.resolve('public', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => {});
    }
    return { success: true, provider: 'local_disk' };
  }

  if (isCloudinaryConfigured()) {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return { success: res.result === 'ok', provider: 'cloudinary' };
    } catch {
      // Best effort deletion
    }
  }

  return { success: true };
};
