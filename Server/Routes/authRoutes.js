const express = require('express');
const router = express.Router();
const {
        createUser, 
        registerUser, 
        loginUser, 
        getAllUsers, 
        updateUserPermissions, 
        deleteUser, 
        changeOwnPassword, 
        adminResetUserPassword 
    } = require('../Controllers/authController');
const { protect, adminOnly, canManageUsers } = require('../middleware/authMiddleware');


router.post('/create-user', protect, canManageUsers, createUser);
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/users', protect, canManageUsers, getAllUsers)
router.patch('/permissions', protect, canManageUsers, updateUserPermissions)
router.put('/change-password', protect, changeOwnPassword);
router.put('/users/reset-password', protect, adminResetUserPassword);

router.delete('/:id', protect, canManageUsers, deleteUser);

module.exports = router;