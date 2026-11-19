const express = require('express');
const router = express.Router();
const { getReturns, createReturn } = require('../Controllers/returnController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.get('/', protect, checkPermission('products'), getReturns);
router.post('/', protect, checkPermission('products'), createReturn);

module.exports = router;