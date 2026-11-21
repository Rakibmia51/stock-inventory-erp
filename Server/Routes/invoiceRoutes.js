const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, deleteInvoice } = require('../Controllers/invoiceController');
const { protect, adminOnly , checkPermission} = require('../middleware/authMiddleware');

router.get('/', protect, checkPermission('invoices'), getInvoices);
router.post('/', protect, checkPermission('invoices'), createInvoice);
router.delete('/:id', protect, checkPermission('invoices'), deleteInvoice);

module.exports = router;