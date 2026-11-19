const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase, deletePurchase } = require('../Controllers/purchaseController');
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');

router.get('/', protect, checkPermission('purchases'), getPurchases);
router.post('/', protect, checkPermission('purchases'), createPurchase);
router.delete('/:id', protect, checkPermission('purchases'), deletePurchase);

module.exports = router;