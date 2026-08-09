# Crypto Alerts - Real-time Project Monitoring

Automated alerts for new crypto/NFT projects, testnet launches, and funding rounds with multi-channel notifications.

## Features

- 🐦 **Twitter Monitoring** - Real-time tracking of crypto project announcements
- 🤖 **Telegram Bot** - Instant alerts with subscription management
- 📧 **Email Digest** - Hourly summaries of new projects
- 📊 **Web Dashboard** - Historical data, search, and analytics
- 🎯 **Smart Detection** - AI-powered event classification (testnet, NFT, funding)
- ⏰ **Hourly Digest** - Aggregated alerts delivered on schedule

## Alert Types

- **Testnet Launches** - New testnet releases
- **NFT Projects** - NFT collection announcements
- **Funding Rounds** - Series A, B, C, etc.
- **Mainnet Launches** - Token/protocol launches
- **Partnerships** - Strategic collaborations

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: React + Vite
- **Bot**: Telegram Bot API
- **Email**: Nodemailer/SendGrid
- **Monitoring**: Twitter API v2
- **Containerization**: Docker

## Project Structure

```
crypto-alerts/
├── backend/              # Express.js server
├── frontend/             # React dashboard
├── telegram-bot/         # Telegram bot service
├── email-service/        # Email notification service
├── scripts/              # Database migrations & utils
├── docker-compose.yml    # Local development setup
├── .env.example          # Environment template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)
- Twitter API v2 keys
- Telegram Bot token
- SendGrid/Email service credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/EMRGKC1/crypto-alerts.git
cd crypto-alerts
```

2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../telegram-bot && npm install
cd ../email-service && npm install
```

3. Setup environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start services
```bash
docker-compose up -d
# or manually start each service
```

## Configuration

See `.env.example` for all required environment variables:
- Twitter API credentials
- Telegram Bot token
- Database connection string
- Email service credentials
- Alert preferences

## API Documentation

See `backend/README.md` for complete API documentation.

## Dashboard

Access the web dashboard at `http://localhost:3000`

## Telegram Bot Commands

- `/start` - Start receiving alerts
- `/stop` - Stop receiving alerts
- `/subscribe testnet` - Subscribe to testnet alerts
- `/subscribe nft` - Subscribe to NFT alerts
- `/subscribe funding` - Subscribe to funding alerts
- `/preferences` - Manage alert preferences
- `/history` - View recent alerts

## Development

```bash
# Backend development
cd backend && npm run dev

# Frontend development
cd frontend && npm run dev

# Telegram bot
cd telegram-bot && npm start

# Email service
cd email-service && npm start
```

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please create a GitHub issue.
