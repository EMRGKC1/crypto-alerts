import express from 'express';
import { pool } from '../database/db.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const { type, platform, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT a.*, p.name as project_name FROM alerts a JOIN projects p ON a.project_id = p.id WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND a.alert_type = $' + (params.length + 1);
      params.push(type);
    }

    query += ' ORDER BY a.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get unsent alerts
router.get('/unsent', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as project_name FROM alerts a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.is_sent = false 
       ORDER BY a.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching unsent alerts:', error);
    res.status(500).json({ error: 'Failed to fetch unsent alerts' });
  }
});

// Mark alert as sent
router.post('/:id/sent', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, userId } = req.body;

    await pool.query('UPDATE alerts SET is_sent = true WHERE id = $1', [id]);

    if (userId) {
      await pool.query(
        'INSERT INTO notifications_sent (user_id, alert_id, notification_type, status, sent_at) VALUES ($1, $2, $3, $4, $5)',
        [userId, id, platform, 'sent', new Date()]
      );
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error marking alert as sent:', error);
    res.status(500).json({ error: 'Failed to mark alert as sent' });
  }
});

export default router;
