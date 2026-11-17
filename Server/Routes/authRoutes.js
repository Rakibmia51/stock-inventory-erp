const express = require('express');
const router = express.Router();
const {createUser, registerUser, loginUser, getAllUsers, updateUserPermissions } = require('../Controllers/authController');
const { protect, adminOnly, canManageUsers } = require('../middleware/authMiddleware');


router.post('/create-user', protect, canManageUsers, createUser);
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/users', protect, canManageUsers, getAllUsers)
router.patch('/permissions', protect, canManageUsers, updateUserPermissions)

module.exports = router;