const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateStock,
  deleteProduct
} = require('../Controllers/productController');

// রাউটস ডিফিনিশন
router.get('/', getProducts);
router.post('/', createProduct);
router.patch('/:id/stock', updateStock);
router.delete('/:id', deleteProduct);

module.exports = router;