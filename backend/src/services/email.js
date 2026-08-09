import nodemailer from 'nodemailer';
import { pool } from '../database/db.js';
import logger from '../utils/logger.js';
import Handlebars from 'handlebars';

class EmailService {
  constructor() {
    this.transporter = null;
    this.digestSchedule = null;
  }

  initialize() {
    if (process.env.SENDGRID_API_KEY) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    }
  }

  startDigestScheduler() {
    this.initialize();
    const interval = parseInt(process.env.DIGEST_INTERVAL) || 3600000; // Default 1 hour
    
    this.digestSchedule = setInterval(() => {
      this.sendHourlyDigest().catch(err => {
        logger.error('Error sending digest:', err);
      });
    }, interval);

    logger.info('Email digest scheduler started');
  }

  async sendHourlyDigest() {
    try {
      const users = await pool.query(
        'SELECT id, email FROM users WHERE email_enabled = true ORDER BY id'
      );

      for (const user of users.rows) {
        await this.sendDigestToUser(user.id, user.email);
      }
    } catch (error) {
      logger.error('Error sending hourly digest:', error);
    }
  }

  async sendDigestToUser(userId, email) {
    try {
      const alerts = await pool.query(
        `SELECT a.*, p.name FROM alerts a 
         JOIN projects p ON a.project_id = p.id 
         WHERE a.created_at > NOW() - INTERVAL '1 hour' 
         ORDER BY a.created_at DESC`
      );

      if (alerts.rows.length === 0) {
        return;
      }

      const subject = `Crypto Alerts Digest - ${alerts.rows.length} New Updates`;
      const html = this.generateDigestHTML(alerts.rows);

      await this.transporter.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject,
        html
      });

      logger.info(`Sent digest to ${email}`);
    } catch (error) {
      logger.error(`Error sending digest to ${email}:`, error);
    }
  }

  generateDigestHTML(alerts) {
    const template = Handlebars.compile(`
      <h1>Crypto Alerts Digest</h1>
      <p>You have {{count}} new updates:</p>
      <ul>
      {{#each alerts}}
        <li>
          <strong>{{this.name}}</strong> - {{this.alert_type}}
          <p>{{this.description}}</p>
        </li>
      {{/each}}
      </ul>
    `);

    return template({ alerts, count: alerts.length });
  }

  async sendAlertEmail(email, alert) {
    try {
      const subject = `Alert: ${alert.title}`;
      const html = `
        <h2>${alert.title}</h2>
        <p>${alert.description}</p>
        <a href="${alert.source_url}">View Source</a>
      `;

      await this.transporter.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject,
        html
      });
    } catch (error) {
      logger.error('Error sending alert email:', error);
      throw error;
    }
  }
}

export default new EmailService();
