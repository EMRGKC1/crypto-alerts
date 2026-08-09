import pkg from 'pg';
import logger from '../utils/logger.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

async function initializeDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connected:', result.rows[0]);
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export { pool, initializeDatabase };
