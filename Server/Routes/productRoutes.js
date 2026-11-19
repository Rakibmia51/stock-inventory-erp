const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateStock,
  deleteProduct,
  handleProductReturn
} = require('../Controllers/productController');
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');

// রাউটস ডিফিনিশন
router.get('/', protect, checkPermission('products'), getProducts);
router.post('/', protect, checkPermission('products'), createProduct);
router.post('/:id/return', protect, checkPermission('products'), handleProductReturn);
router.patch('/:id/stock', protect, checkPermission('products'), updateStock);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;