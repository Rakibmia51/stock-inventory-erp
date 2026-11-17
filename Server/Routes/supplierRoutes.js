const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, deleteSupplier } = require('../Controllers/supplierController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getSuppliers);
router.post('/', protect, adminOnly, createSupplier);
router.delete('/:id',protect, adminOnly, deleteSupplier);

module.exports = router;