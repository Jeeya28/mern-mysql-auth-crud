const db = require('../config/db');

//GET ALL ITEMS  
exports.getItems = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM items WHERE user_id = ?',
      [req.user.id]
    );

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET SINGLE ITEM  
exports.getItemById = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(items[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//CREATE ITEM  
exports.createItem = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description, status || 'active']
    );

    res.status(201).json({
      message: 'Item created',
      itemId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE ITEM  
exports.updateItem = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const [result] = await db.query(
      'UPDATE items SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, description, status, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found or not authorized' });
    }

    res.json({ message: 'Item updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE ITEM  
exports.deleteItem = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found or not authorized' });
    }

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//STATS  
exports.getStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const [[total]] = await db.query(
      "SELECT COUNT(*) as count FROM items WHERE user_id = ?",
      [userId]
    );

    const [[active]] = await db.query(
      "SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status='active'",
      [userId]
    );

    const [[pending]] = await db.query(
      "SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status='pending'",
      [userId]
    );

    const [[completed]] = await db.query(
      "SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status='completed'",
      [userId]
    );

    res.json({
      total: total.count,
      active: active.count,
      pending: pending.count,
      completed: completed.count,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};