const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  validateProduct,
  handleValidationErrors,
} = require('../middleware/validateMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

router.post(
  '/',
  protect,
  admin,
  validateProduct,
  handleValidationErrors,
  createProduct
);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
