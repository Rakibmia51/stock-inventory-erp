const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, deleteSupplier } = require('../Controllers/supplierController');
const { protect, adminOnly, canManageUsers } = require('../middleware/authMiddleware');

router.get('/', protect, getSuppliers);
router.post('/', protect, createSupplier);
router.delete('/:id',protect, deleteSupplier);

module.exports = router;
