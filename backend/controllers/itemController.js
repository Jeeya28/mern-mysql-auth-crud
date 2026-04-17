const db = require('../config/db');

//GET ALL ITEMS  
exports.getItems = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = ['user_id = ?'];
    let params = [req.user.id];

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status && ['active', 'pending', 'completed'].includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    // Get total count for pagination
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM items ${whereClause}`,
      params
    );

    // Get paginated items
    const [items] = await db.query(
      `SELECT * FROM items ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

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