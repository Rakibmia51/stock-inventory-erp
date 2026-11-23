const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  deleteTransaction
} = require('../Controllers/accountController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// সব অ্যাকাউন্টস ট্রানজ্যাকশন দেখা (Income, Expense, Others, Due Collection, Supplier Payment)
router.get('/', protect, getTransactions);

// নতুন এন্ট্রি তৈরি করা
router.post('/', protect, checkPermission('accounts'), createTransaction);

// এন্ট্রি ডিলিট করা (Admin বা Accounts পারমিশন থাকলে)
router.delete('/:id', protect, checkPermission('accounts'), deleteTransaction);

module.exports = router;