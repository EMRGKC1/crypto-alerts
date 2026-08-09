import express from 'express';
import { pool } from '../database/db.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Get user preferences
router.get('/:id/preferences', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT alert_preferences, email_enabled, telegram_enabled FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
router.put('/:id/preferences', async (req, res) => {
  try {
    const { id } = req.params;
    const { alert_preferences, email_enabled, telegram_enabled } = req.body;

    await pool.query(
      'UPDATE users SET alert_preferences = $1, email_enabled = $2, telegram_enabled = $3 WHERE id = $4',
      [alert_preferences, email_enabled, telegram_enabled, id]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
