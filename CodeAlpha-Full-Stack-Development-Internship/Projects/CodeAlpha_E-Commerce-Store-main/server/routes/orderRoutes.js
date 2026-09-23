const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateOrder,
  handleValidationErrors,
} = require('../middleware/validateMiddleware');

router.use(protect);

router.post('/', validateOrder, handleValidationErrors, createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);

module.exports = router;
