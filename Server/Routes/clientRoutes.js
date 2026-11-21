const express = require('express');
const router = express.Router();
const { getClients, createClient, deleteClient, updateClient } = require('../Controllers/clientController');
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');

router.get('/', protect, checkPermission('clients'), getClients);
router.post('/', protect, checkPermission('clients'), createClient);
router.put('/:id', protect, checkPermission('clients'), updateClient);
router.delete('/:id', protect, adminOnly, deleteClient);

module.exports = router;