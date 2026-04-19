const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  deleteAvatar
} = require('../controllers/profileController');

// All routes protected
router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', authMiddleware, deleteAvatar);

module.exports = router;