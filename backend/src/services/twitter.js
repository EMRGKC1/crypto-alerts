import { TwitterApi } from 'twitter-api-v2';
import logger from '../utils/logger.js';
import { pool } from '../database/db.js';
import { detectAlertType } from '../utils/nlp.js';
import eventEmitter from '../events/emitter.js';

class TwitterService {
  constructor() {
    this.client = null;
    this.isRunning = false;
    this.monitoringInterval = null;
  }

  initialize() {
    const { TWITTER_BEARER_TOKEN, TWITTER_API_KEY, TWITTER_API_SECRET } = process.env;
    
    if (!TWITTER_BEARER_TOKEN) {
      throw new Error('Twitter API credentials not configured');
    }

    this.client = new TwitterApi(TWITTER_BEARER_TOKEN);
  }

  async startMonitoring() {
    try {
      this.initialize();
      this.isRunning = true;
      logger.info('Twitter monitoring started');

      const checkInterval = parseInt(process.env.TWITTER_MONITOR_INTERVAL) || 300000;
      
      // Run initial check
      await this.checkForNewProjects();

      // Set interval for periodic checks
      this.monitoringInterval = setInterval(() => {
        this.checkForNewProjects().catch(err => {
          logger.error('Error in Twitter monitoring interval:', err);
        });
      }, checkInterval);
    } catch (error) {
      logger.error('Failed to start Twitter monitoring:', error);
      this.isRunning = false;
    }
  }

  async checkForNewProjects() {
    try {
      const keywords = process.env.TWITTER_SEARCH_KEYWORDS?.split(' ') || [
        'crypto',
        'testnet',
        'NFT',
        'Web3',
        'DeFi'
      ];

      const query = this.buildSearchQuery(keywords);
      logger.info(`Searching Twitter with query: ${query}`);

      const tweets = await this.client.v2.search(query, {
        'max_results': 100,
        'tweet.fields': 'created_at,public_metrics,author_id',
        'expansions': 'author_id',
        'user.fields': 'username,verified,followers_count'
      });

      if (tweets.data && tweets.data.length > 0) {
        await this.processTweets(tweets.data, tweets.includes?.users || []);
      }
    } catch (error) {
      logger.error('Error checking Twitter for new projects:', error);
    }
  }

  buildSearchQuery(keywords) {
    const keywordString = keywords.join(' OR ');
    const filters = [
      keywordString,
      '-is:retweet',
      'lang:en'
    ];

    // Add negative keywords to filter spam
    const negativeKeywords = process.env.TWITTER_FILTER_KEYWORDS?.split(' ') || [
      '-test',
      '-scam',
      '-fake'
    ];

    return filters.concat(negativeKeywords).join(' ');
  }

  async processTweets(tweets, users) {
    for (const tweet of tweets) {
      try {
        const author = users.find(u => u.id === tweet.author_id);
        
        // Skip low-follower accounts (likely not official)
        if (author && author.followers_count < 100) {
          continue;
        }

        // Check if already processed
        const existing = await pool.query(
          'SELECT id FROM twitter_posts WHERE twitter_id = $1',
          [tweet.id]
        );

        if (existing.rows.length > 0) {
          continue;
        }

        // Save tweet to database
        await pool.query(
          `INSERT INTO twitter_posts (twitter_id, author_username, content, created_at, processed)
           VALUES ($1, $2, $3, $4, $5)`,
          [tweet.id, author?.username, tweet.text, tweet.created_at, false]
        );

        // Detect alert type using NLP
        const { alertType, confidence } = await detectAlertType(tweet.text);

        if (confidence > 0.6) {
          // Extract project info from tweet
          const projectInfo = await this.extractProjectInfo(tweet.text, author);

          if (projectInfo) {
            // Save or update project
            const project = await this.saveProject(projectInfo);

            // Create alert
            await pool.query(
              `INSERT INTO alerts 
               (project_id, alert_type, title, description, content, source_url, source_platform, confidence_score, detected_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                project.id,
                alertType,
                `New ${alertType}: ${projectInfo.name}`,
                projectInfo.description,
                tweet.text,
                `https://twitter.com/${author?.username}/status/${tweet.id}`,
                'twitter',
                confidence,
                new Date()
              ]
            );

            // Emit event for real-time processing
            eventEmitter.emit('newAlert', {
              project,
              alertType,
              confidence
            });

            logger.info(`Detected ${alertType} alert for project: ${projectInfo.name}`);
          }
        }
      } catch (error) {
        logger.error('Error processing tweet:', error);
      }
    }
  }

  async extractProjectInfo(content, author) {
    // Simple extraction logic - can be enhanced with ML/NLP
    const patterns = {
      testnet: /testnet|beta launch|launch on testnet/i,
      nft: /nft|nft collection|nft drop|nft project/i,
      funding: /funding round|series [a-z]|seed round|investment|raised/i
    };

    // Extract project name (usually capitalized words or hashtags)
    const projectNameMatch = content.match(/#?[A-Z][a-zA-Z0-9]*/);
    const projectName = projectNameMatch ? projectNameMatch[0].replace('#', '') : author?.username;

    return {
      name: projectName,
      description: content.substring(0, 500),
      twitter_handle: author?.username,
      data_source: 'twitter'
    };
  }

  async saveProject(projectInfo) {
    const slug = projectInfo.name.toLowerCase().replace(/\s+/g, '-');

    const result = await pool.query(
      `INSERT INTO projects (name, slug, description, twitter_handle, data_source, verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (name) DO UPDATE SET last_updated_at = CURRENT_TIMESTAMP
       RETURNING id, name, slug`,
      [projectInfo.name, slug, projectInfo.description, projectInfo.twitter_handle, projectInfo.data_source, false]
    );

    return result.rows[0];
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.isRunning = false;
    logger.info('Twitter monitoring stopped');
  }
}

export default new TwitterService();
