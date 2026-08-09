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
  project_type VARCHAR(100), -- 'testnet', 'nft', 'protocol', 'token'
  category VARCHAR(100), -- 'DeFi', 'NFT', 'Gaming', 'Infrastructure', etc.
  status VARCHAR(50), -- 'announced', 'testnet', 'mainnet', 'launched'
  total_funding BIGINT, -- in USD
  funding_rounds JSONB,
  contract_address VARCHAR(255),
  blockchain VARCHAR(100), -- 'ethereum', 'solana', 'polygon', etc.
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_source VARCHAR(100), -- 'twitter', 'discord', 'api', 'manual'
  external_id VARCHAR(255), -- external service ID
  verified BOOLEAN DEFAULT false
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'testnet', 'nft', 'funding', 'launch', 'partnership'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT, -- Full tweet/post content
  source_url VARCHAR(500),
  source_platform VARCHAR(50), -- 'twitter', 'discord', 'telegram', 'reddit'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  metadata JSONB, -- Additional data
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_sent BOOLEAN DEFAULT false
);

-- User Alert Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id, alert_type)
);

-- Alert Notifications Sent
CREATE TABLE IF NOT EXISTS notifications_sent (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- 'email', 'telegram', 'push'
  status VARCHAR(50), -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Digest History
CREATE TABLE IF NOT EXISTS email_digests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_ids INTEGER[] NOT NULL, -- Array of alert IDs included in digest
  email_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'sent', -- 'pending', 'sent', 'failed'
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

-- Event Log
CREATE TABLE IF NOT EXISTS event_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- 'project_detected', 'alert_created', 'notification_sent'
  entity_type VARCHAR(50), -- 'project', 'alert', 'user'
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_alerts_project_id ON alerts(project_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_is_sent ON alerts(is_sent);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_notifications_user_id ON notifications_sent(user_id);
CREATE INDEX idx_notifications_status ON notifications_sent(status);
CREATE INDEX idx_twitter_posts_project_id ON twitter_posts(project_id);
CREATE INDEX idx_twitter_posts_processed ON twitter_posts(processed);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at DESC);
