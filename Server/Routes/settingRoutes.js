const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../Controllers/settingController');
const { protect, adminOnly, canManageUsers , checkPermission} = require('../middleware/authMiddleware');


router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;