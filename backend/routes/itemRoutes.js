const express = require('express');
const router = express.Router();

const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getStats
} = require('../controllers/itemController');

const authMiddleware = require('../middleware/auth');

// Protected routes
router.get('/stats', authMiddleware, getStats);
router.get('/', authMiddleware, getItems);
router.get('/:id', authMiddleware, getItemById);
router.post('/', authMiddleware, createItem);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;