const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice } = require('../Controllers/invoiceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getInvoices);
router.post('/', protect, createInvoice);

module.exports = router;