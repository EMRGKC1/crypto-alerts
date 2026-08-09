import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import axios from 'axios';
import logger from './utils/logger.js';
import { pool } from './database/db.js';
import { registerHandlers } from './handlers/index.js';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN not configured');
}

const bot = new TelegramBot(TOKEN, { polling: true });
const API_URL = process.env.API_URL || 'http://localhost:5000';

logger.info('Telegram bot starting...');

// Register all command handlers
registerHandlers(bot);

// Handle incoming alerts from backend
async function setupAlertListener() {
  // Poll backend for unsent alerts
  setInterval(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/alerts/unsent?platform=telegram`);
      const alerts = response.data;

      for (const alert of alerts) {
        // Get all users subscribed to this alert type
        const subscribers = await pool.query(
          `SELECT DISTINCT u.telegram_id, u.id 
           FROM users u
           JOIN user_subscriptions s ON u.id = s.user_id
           WHERE s.alert_type = $1 AND u.telegram_enabled = true AND u.telegram_id IS NOT NULL`,
          [alert.alert_type]
        );

        for (const user of subscribers.rows) {
          try {
            const message = formatAlertMessage(alert);
            await bot.sendMessage(user.telegram_id, message, {
              parse_mode: 'HTML',
              disable_web_page_preview: true
            });

            // Mark as sent
            await axios.post(`${API_URL}/api/alerts/${alert.id}/sent`, {
              platform: 'telegram',
              userId: user.id
            });

            logger.info(`Sent telegram alert to user ${user.telegram_id}`);
          } catch (error) {
            logger.error(`Failed to send telegram alert to ${user.telegram_id}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error('Error fetching alerts:', error);
    }
  }, 60000); // Check every minute
}

function formatAlertMessage(alert) {
  const emoji = {
    'testnet': '🧪',
    'nft': '🎨',
    'funding': '💰',
    'launch': '🚀',
    'partnership': '🤝'
  };

  return `
${emoji[alert.alert_type] || '📢'} <b>${alert.title}</b>

<b>Type:</b> ${alert.alert_type}
<b>Project:</b> ${alert.project_name}

${alert.description}

🔗 <a href="${alert.source_url}">View Source</a>
  `.trim();
}

// Start alert listener
setupAlertListener();

// Bot event handlers
bot.on('message', (msg) => {
  logger.info(`Message from ${msg.chat.id}: ${msg.text}`);
});

bot.on('polling_error', (error) => {
  logger.error('Telegram polling error:', error);
});

logger.info('Telegram bot is running');

export { bot };
