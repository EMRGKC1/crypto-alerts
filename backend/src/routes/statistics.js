import express from 'express';
import { pool } from '../database/db.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const projectCount = await pool.query('SELECT COUNT(*) as count FROM projects');
    const alertCount = await pool.query('SELECT COUNT(*) as count FROM alerts');
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const recentAlerts = await pool.query(
      'SELECT a.*, p.name FROM alerts a JOIN projects p ON a.project_id = p.id ORDER BY a.created_at DESC LIMIT 10'
    );

    res.json({
      projectCount: projectCount.rows[0].count,
      alertCount: alertCount.rows[0].count,
      userCount: userCount.rows[0].count,
      recentAlerts: recentAlerts.rows
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get alerts by type
router.get('/alerts/by-type', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT alert_type, COUNT(*) as count FROM alerts GROUP BY alert_type'
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching alert statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
