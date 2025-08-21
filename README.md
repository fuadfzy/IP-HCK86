# 🍽️ AI Restaurant Ordering System

## Overview
A complete full-stack restaurant ordering system with QR code table identification, AI-driven chat recommendations, Google authentication, real-time cart management, order history, and secure payment processing via Midtrans.

### 🚀 Key Features
- **📱 Mobile-First Design** - Optimized for 390px mobile screens with dark theme
- **🔍 QR Code Scanning** - Table identification with camera integration
- **🔐 Google OAuth Authentication** - Secure login with JWT token protection
- **🤖 AI Chat Assistant** - OpenAI GPT-4o powered food recommendations with Indonesian language support
- **🛒 Dynamic Shopping Cart** - Real-time cart with persistent state across navigation
- **💳 Secure Payments** - Full Midtrans integration with webhook notifications and redirect handling
- **📋 Order Management** - Complete order history with edit/delete capabilities for pending orders
- **🎯 Smart Session Management** - 30-minute table sessions with QR code validation
- **🔔 Custom Notifications** - Beautiful modal popups instead of browser alerts
- **📊 Real-time Updates** - Auto-refresh order status and payment notifications

## 🏗️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router** for seamless navigation  
- **Bootstrap 5** for responsive mobile-first UI
- **Custom Components** for modals and notifications
- **Camera API** for QR code scanning

### Backend
- **Node.js** with Express framework
- **PostgreSQL** with Sequelize ORM
- **JWT Authentication** with Google OAuth 2.0
- **OpenAI GPT-4o** API integration
- **Midtrans Payment Gateway** with webhook support
- **Ngrok** for public webhook endpoints

### Payment & Integration
- **Midtrans Snap** for secure payment processing
- **Google OAuth 2.0** for user authentication
- **OpenAI API** for intelligent recommendations
- **Webhook Notifications** for real-time payment updates

## 🌟 Complete User Journey

### 1. **QR Scanning & Session**
```
Scan QR Code → Validate Table → Create Session → Login with Google
```

### 2. **Choice Selection**
```
Choice Page → AI Chat Assistant OR Browse Menu → Order History Access
```

### 3. **AI Chat Experience**
```
Chat Interface → AI Recommendations → Add to Cart → Smart Filtering
```

### 4. **Menu Browsing**
```
Menu Categories → Product Details → Add to Cart → Quantity Management
```

### 5. **Cart & Checkout**
```
Review Items → Modify Quantities → Proceed to Payment → Order Creation
```

### 6. **Payment Processing**
```
Midtrans Snap → Multiple Payment Methods → Webhook Notifications → Status Updates
```

### 7. **Order Management**
```
Order History → Pay Pending Orders → Edit Orders → Delete Orders
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- Ngrok for webhook tunneling

### 1. Clone Repository
```bash
git clone <repository-url>
cd IP-HCK86-clone
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Database Setup
```bash
# Create PostgreSQL database
# Configure connection in backend/.env
# Run migrations and seeders
```

### 5. Ngrok Setup (for webhooks)
```bash
ngrok http 3001
# Update BACKEND_URL in .env with ngrok URL
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_ordering
DB_USER=postgres
DB_PASS=yourpassword

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Payment
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# AI
OPENAI_API_KEY=your_openai_api_key

# URLs
BACKEND_URL=https://your-ngrok-url.ngrok-free.app
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## 📡 API Endpoints

### 🔐 Authentication (Public)
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle OAuth callback

### 🍽️ Menu Management (Protected)
- `GET /menu-items` - Get all menu items with images

### 🏪 Session Management (Mixed Protection)
- `POST /sessions` - Create session with QR code (Public)

### 📝 Order Management (Protected)
- `GET /orders` - Get orders by session/table
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order (pending only)
- `DELETE /orders/:id` - Delete order (pending only)

### 💳 Payment Processing
- `POST /payments` - Create Midtrans payment token (Protected)
- `POST /payments/notification` - Midtrans webhook (Public)
- `GET /payment/finish` - Payment success redirect (Public)
- `GET /payment/unfinish` - Payment cancelled redirect (Public)
- `GET /payment/error` - Payment error redirect (Public)

### 🤖 AI Assistant (Protected)
- `POST /ai/chat` - Get AI food recommendations
  ```json
  Request: {
    "messages": [{"role": "user", "content": "Saya ingin makan pedas"}]
  }
  Response: {
    "reply": [
      {
        "name": "Ayam Geprek",
        "description": "Ayam crispy dengan sambal pedas",
        "price": "25000",
        "imageUrl": "..."
      }
    ]
  }
  ```

## 🎨 Frontend Pages & Components

### 📱 Core Pages
- **LandingPage** - Welcome screen with QR scanner
- **SessionPage** - Manual table code entry
- **QRSessionPage** - QR validation and session creation
- **LoginPage** - Google OAuth integration
- **ChoicePage** - AI Chat vs Menu selection
- **MenuPage** - Product catalog with categories
- **ChatPage** - AI assistant interface
- **CartPage** - Shopping cart with edit mode
- **PaymentPage** - Midtrans integration
- **OrderHistoryPage** - Order management

### 🎯 Payment Flow Pages
- **PaymentSuccessPage** - Payment confirmation
- **PaymentFinishPage** - Midtrans success redirect
- **PaymentUnfinishPage** - Payment cancellation
- **PaymentErrorPage** - Payment failure handling

### 🧩 Reusable Components
- **CustomModal** - Beautiful notification popups
- **QRScanner** - Camera-based QR code reader
- **Cart Management** - Dynamic cart with persistence

## 🔄 Advanced Features

### 🛒 Smart Cart System
- Persistent cart across navigation
- Real-time quantity updates
- Edit mode for existing orders
- Visual cart icon with item count

### 🤖 AI Integration
- Indonesian language support
- Context-aware recommendations
- Keyword filtering for menu items
- Anti-duplication logic
- Prompt engineering for restaurant context

### 💳 Payment Features
- Multiple payment methods via Midtrans
- Real-time webhook notifications
- Order status auto-updates
- Payment retry for pending orders
- Redirect handling for all scenarios

### 📊 Order Management
- Order history with auto-refresh
- Edit pending orders
- Delete pending orders
- Pay pending orders
- Status tracking (pending → paid → failed)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```
- Comprehensive API endpoint testing
- JWT authentication testing
- Database integration testing
- Payment webhook testing

### Frontend Testing
```bash
cd frontend
npm test
```
- Component unit testing
- Integration testing
- User flow testing

## 🚀 Deployment

### Quick Deploy to Railway
```bash
# Run deployment script
./deploy.sh
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Supported Platforms
- **Railway** (Recommended - Free tier available)
- **Render** (Alternative - Free tier available)
- **Heroku** (Paid)
- **VPS/DigitalOcean** (Manual setup)

## 🚀 Deployment Considerations

### Production Setup
1. **Database**: Use production PostgreSQL
2. **Environment**: Set production environment variables
3. **Webhooks**: Configure Midtrans with production URLs
4. **SSL**: Enable HTTPS for secure payments
5. **Domain**: Use custom domain instead of ngrok

### Security Features
- JWT token authentication
- Protected API endpoints
- Secure payment processing
- Input validation and sanitization
- Environment variable protection

## 📈 Progress Status

### ✅ Completed Features
- [x] Complete QR scanning system
- [x] Google OAuth authentication
- [x] AI chat with OpenAI integration
- [x] Dynamic shopping cart
- [x] Full payment integration with Midtrans
- [x] Order history and management
- [x] Edit/delete pending orders
- [x] Pay pending orders
- [x] Custom modal notifications
- [x] Mobile-first responsive design
- [x] Real-time order updates
- [x] Webhook notification handling
- [x] Payment redirect flows
- [x] Session management with expiry

### 🎯 System Highlights
- **100% Mobile Optimized** - Perfect for restaurant tablet/phone use
- **Production Ready** - Full webhook integration and error handling
- **User Friendly** - Intuitive flow from QR scan to payment
- **AI Powered** - Smart recommendations in Indonesian
- **Secure** - JWT protection and secure payment processing

## 📞 Support & Contributing

For issues, feature requests, or contributions, please create an issue in the repository.

## 📄 License
MIT License
