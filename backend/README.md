# 🍽️ TableTalk Backend API

AI-powered restaurant ordering system backend with QR code scanning, Google OAuth, OpenAI integration, and Midtrans payments.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Production
```bash
# Deploy to Railway
./deploy.sh
```

## 📡 API Endpoints

### Health Check
- `GET /` - API status check

### Authentication (Public)
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - OAuth callback

### Sessions (Public)
- `POST /sessions` - Create session with QR code

### Protected Endpoints (Require JWT)
- `GET /menu-items` - Get menu items
- `GET /orders` - Get user orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order (pending only)
- `DELETE /orders/:id` - Delete order (pending only)
- `POST /payments` - Create payment token
- `POST /ai/chat` - AI menu recommendations

### Payment Webhooks (Public)
- `POST /payments/notification` - Midtrans webhook
- `GET /payment/finish` - Payment success redirect
- `GET /payment/unfinish` - Payment pending redirect
- `GET /payment/error` - Payment error redirect

## 🛠️ Tech Stack

- **Node.js + Express** - Web framework
- **PostgreSQL + Sequelize** - Database ORM
- **JWT + Google OAuth** - Authentication
- **OpenAI GPT-4o** - AI recommendations
- **Midtrans** - Payment gateway
- **Jest** - Testing framework

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tabletalk_db
DB_USER=postgres
DB_PASS=yourpassword

# Authentication
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Payment
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# AI
OPENAI_API_KEY=your-openai-api-key

# URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

## 🚀 Deployment

### Railway (Recommended)
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub
4. Select `backend` folder as root directory
5. Add PostgreSQL database
6. Configure environment variables
7. Deploy!

### Other Platforms
- **Render**: Similar to Railway
- **Heroku**: Use Procfile
- **VPS**: Manual setup with PM2

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific endpoint
curl http://localhost:3001/
```

## 📊 Database

### Models
- **User** - Google OAuth users
- **Table** - Restaurant tables with QR codes
- **Session** - Table sessions (30min expiry)
- **MenuItem** - Menu catalog with images
- **Order** - Orders with status tracking
- **OrderItem** - Order line items

### Commands
```bash
# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Reset database
npm run db:reset
```

## 🤖 AI Features

- Indonesian language support
- Context-aware menu recommendations
- Smart keyword filtering
- Anti-duplication logic
- Stepwise preference gathering

## 💳 Payment Integration

- Midtrans Snap integration
- Real-time webhook notifications
- Multiple payment methods
- Order status tracking
- Redirect handling

## 🛡️ Security

- JWT token authentication
- Google OAuth 2.0 integration
- Protected API endpoints
- Input validation
- CORS configuration

## 📈 API Status

Test API health: [http://localhost:3001/](http://localhost:3001/)

Expected response:
```json
{
  "status": "TableTalk API is up and running. do your thing.",
  "timestamp": "2025-08-21T...",
  "environment": "development"
}
```
