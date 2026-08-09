# Quick Start Guide

## Prerequisites

Before you begin, ensure you have installed:
- **Docker & Docker Compose** (Recommended for easiest setup)
  - Download from: https://www.docker.com/products/docker-desktop
- **Node.js 18+** (If running without Docker)
  - Download from: https://nodejs.org/
- **PostgreSQL 13+** (If running without Docker)

## Option 1: Run with Docker (Easiest) ⭐

### Step 1: Clone the Repository
```bash
git clone https://github.com/EMRGKC1/crypto-alerts.git
cd crypto-alerts
```

### Step 2: Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- **Twitter API**: Get from https://developer.twitter.com/
- **Telegram Bot Token**: Get from @BotFather on Telegram
- **Email Credentials**: SendGrid API key or SMTP settings
- Other configuration as needed

### Step 3: Start All Services
```bash
docker-compose up -d
```

This will start:
- 🗄️ PostgreSQL Database (port 5432)
- 🔌 Backend API (port 5000)
- 🤖 Telegram Bot (polling for messages)
- 📧 Email Service (scheduled digests)
- 🌐 Frontend Dashboard (port 3000)
- 📦 Redis Cache (port 6379)

### Step 4: Access the Application
- **Web Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

---

## Option 2: Run Locally (Advanced)

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Telegram Bot:**
```bash
cd ../telegram-bot
npm install
```

**Email Service:**
```bash
cd ../email-service
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### Step 2: Set Up Database

Start PostgreSQL and create database:
```bash
createdb crypto_alerts
psql crypto_alerts < scripts/init.sql
```

Or use Docker for just the database:
```bash
docker run -d \
  --name postgres-crypto \
  -e POSTGRES_USER=crypto_user \
  -e POSTGRES_PASSWORD=crypto_password \
  -e POSTGRES_DB=crypto_alerts \
  -p 5432:5432 \
  postgres:15-alpine

# Then initialize schema
psql -h localhost -U crypto_user -d crypto_alerts -f scripts/init.sql
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Step 4: Start Each Service (in separate terminals)

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Telegram Bot:**
```bash
cd telegram-bot
npm start
```

**Terminal 3 - Email Service:**
```bash
cd email-service
npm start
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000 (usually http://localhost:5173)
```

---

## Configuration Guide

### Twitter API Setup
1. Go to https://developer.twitter.com/
2. Create an app and get credentials
3. Add to `.env`:
```env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

### Telegram Bot Setup
1. Open Telegram and chat with @BotFather
2. Create a new bot and copy the token
3. Add to `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Email Service Setup

**Option A: SendGrid (Recommended)**
1. Sign up at https://sendgrid.com/
2. Create API key
3. Add to `.env`:
```env
SENDGRID_API_KEY=your_sendgrid_key
ADMIN_EMAIL=noreply@example.com
```

**Option B: Gmail SMTP**
1. Enable 2FA on Gmail
2. Create App Password at https://myaccount.google.com/apppasswords
3. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=your_email@gmail.com
```

---

## Verify Everything is Running

### Check Services Status
```bash
# Docker only
docker-compose ps
```

### Test API
```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 3456.789
}
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f telegram-bot
docker-compose logs -f email-service
```

---

## Using the Application

### Web Dashboard (http://localhost:3000)
- View all detected crypto projects
- Browse alerts by type (testnet, NFT, funding)
- Search and filter projects
- View analytics and statistics

### Telegram Bot Commands
Add the bot to Telegram and use:
- `/start` - Initialize alerts
- `/subscribe testnet` - Get testnet alerts
- `/subscribe nft` - Get NFT alerts
- `/subscribe funding` - Get funding alerts
- `/preferences` - Manage preferences
- `/history` - View recent alerts
- `/stop` - Disable alerts

### Email Digest
- Receive hourly digests of new projects
- Customize frequency in dashboard
- Toggle email notifications on/off

---

## Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Verify connection string in .env
echo $DATABASE_URL
```

### Telegram Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` in `.env`
- Check bot logs: `docker-compose logs telegram-bot`
- Make sure bot is started: `docker-compose restart telegram-bot`

### Email Not Sending
- Check SMTP credentials in `.env`
- View email service logs: `docker-compose logs email-service`
- Verify email addresses are valid

### Twitter API Rate Limited
- Check Twitter API limits in dashboard
- Wait for rate limit reset (usually 15 minutes)
- Consider upgrading Twitter API tier

### Port Already in Use
If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:5173"  # Change 3001 to any free port
```

---

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove data (WARNING: loses all data)
docker-compose down -v
```

---

## Next Steps

1. ✅ Follow the Quick Start above
2. 🔧 Configure your API keys
3. 🚀 Start the application
4. 🌐 Open http://localhost:3000
5. 🤖 Add Telegram bot and test commands
6. 📧 Check email for digest samples

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review `.env.example` for all available options
3. Check GitHub Issues: https://github.com/EMRGKC1/crypto-alerts/issues

Happy monitoring! 🚀
