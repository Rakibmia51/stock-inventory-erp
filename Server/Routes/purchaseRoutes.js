const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase } = require('../Controllers/purchaseController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',protect, getPurchases);
router.post('/',protect, createPurchase);

module.exports = router;