const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, deleteSupplier, updateSupplier } = require('../Controllers/supplierController');
const { protect, adminOnly, canManageUsers , checkPermission} = require('../middleware/authMiddleware');

router.get('/', protect, getSuppliers);
router.post('/', protect, checkPermission('suppliers'), createSupplier);
router.put('/:id', protect, checkPermission('suppliers'), updateSupplier);
router.delete('/:id', protect, checkPermission('suppliers'), deleteSupplier);

module.exports = router;
