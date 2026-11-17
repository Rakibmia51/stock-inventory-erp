const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateStock,
  deleteProduct
} = require('../Controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// রাউটস ডিফিনিশন
router.get('/', protect, getProducts);
router.post('/', protect, adminOnly, createProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;