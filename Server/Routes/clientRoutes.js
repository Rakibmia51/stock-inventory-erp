const express = require('express');
const router = express.Router();
const { getClients, createClient, deleteClient } = require('../Controllers/clientController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',protect, getClients);
router.post('/',protect, adminOnly, createClient);
router.delete('/:id', protect, adminOnly, deleteClient);

module.exports = router;