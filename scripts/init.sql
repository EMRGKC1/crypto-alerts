-- Initialize database schema
-- This file is run automatically when postgres container starts

\c crypto_alerts;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telegram_id BIGINT UNIQUE,
  password_hash VARCHAR(255),
  alert_preferences JSONB DEFAULT '{"testnet": true, "nft": true, "funding": true}',
  email_enabled BOOLEAN DEFAULT true,
  telegram_enabled BOOLEAN DEFAULT true,
  digest_frequency VARCHAR(50) DEFAULT 'hourly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  website VARCHAR(500),
  twitter_handle VARCHAR(255),
  discord_url VARCHAR(500),
  project_type VARCHAR(100),
  category VARCHAR(100),
  status VARCHAR(50),
  total_funding BIGINT,
  funding_rounds JSONB,
  contract_address VARCHAR(255),
  blockchain VARCHAR(100),
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_source VARCHAR(100),
  external_id VARCHAR(255),
  verified BOOLEAN DEFAULT false
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  source_url VARCHAR(500),
  source_platform VARCHAR(50),
  confidence_score DECIMAL(3,2),
  metadata JSONB,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_sent BOOLEAN DEFAULT false
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id, alert_type)
);

-- Notifications Sent
CREATE TABLE IF NOT EXISTS notifications_sent (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  notification_type VARCHAR(50),
  status VARCHAR(50),
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Digests
CREATE TABLE IF NOT EXISTS email_digests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_ids INTEGER[] NOT NULL,
  email_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'sent',
  error_message TEXT
);

-- Twitter Posts Cache
CREATE TABLE IF NOT EXISTS twitter_posts (
  id SERIAL PRIMARY KEY,
  twitter_id BIGINT UNIQUE NOT NULL,
  author_username VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  processed BOOLEAN DEFAULT false
);

-- Event Logs
CREATE TABLE IF NOT EXISTS event_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_sent ON alerts(is_sent);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications_sent(status);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_project_id ON twitter_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_processed ON twitter_posts(processed);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON event_logs(created_at DESC);
