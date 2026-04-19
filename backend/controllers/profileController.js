const db = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, avatar, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE (name, email, phone, bio)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is taken by another user
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use by another account' });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, bio = ? WHERE id = ?',
      [name, email, phone || null, bio || null, req.user.id]
    );

    const [updated] = await db.query(
      'SELECT id, name, email, phone, avatar, bio FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated successfully', user: updated[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get old avatar to delete
    const [users] = await db.query(
      'SELECT avatar FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length > 0 && users[0].avatar) {
      const oldPath = path.join(__dirname, '../uploads', users[0].avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarFilename = req.file.filename;

    await db.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarFilename, req.user.id]
    );

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: avatarFilename,
      avatarUrl: `/uploads/${avatarFilename}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE AVATAR
exports.deleteAvatar = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT avatar FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length > 0 && users[0].avatar) {
      const oldPath = path.join(__dirname, '../uploads', users[0].avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await db.query(
      'UPDATE users SET avatar = NULL WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Avatar removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};