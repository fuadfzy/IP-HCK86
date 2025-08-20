# AI Restaurant Ordering System

## Overview
A full-stack restaurant ordering system with QR code table identification, AI-driven chat recommendations, Google login, and secure payments via Midtrans.

### Features
- QR code scanning for table/session
- Google login authentication
- Chat-based AI food recommendations (OpenAI API)
- React.js frontend (Vite, Redux, React Router)
- Node.js/Express backend
- PostgreSQL for data storage
- Midtrans payment integration
- Temporary sessions (30 min expiry)
- Frontend: Jest, React Testing Library
- Backend: Jest, Mocha

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Setup

#### 1. Frontend
```
cd frontend
npm install
npm run dev
```

#### 2. Backend
```
cd backend
npm install
npm run dev # or node index.js
```

#### 3. Database
- Configure PostgreSQL connection in backend `.env` file.

#### 4. Environment Variables
- See `.env.example` in backend for required keys (Google OAuth, OpenAI, Midtrans, DB, etc).

## Project Structure

- `frontend/` — React app
- `backend/` — Node.js/Express API
- `database/` — SQL migrations, seeders

## Backend API Endpoints

### Menu
- `GET /menu-items` — List all menu items

### Tables
- `GET /tables` — List all tables

### Sessions
- `POST /sessions` — Create session by QR code (start order session for a table)
- `GET /sessions/:id` — Get session info

### Orders
- `GET /orders?session_id=...` — List orders by session
- `GET /orders?table_id=...` — List orders by table
- `POST /orders` — Create new order for a session (with items)
- `GET /orders/:id` — Get order details (with items)

### Order Items
- `PATCH /order-items/:id` — Update quantity of an order item (for unpaid orders only)
- `DELETE /order-items/:id` — Delete an order item (for unpaid orders only)

### Payments
- `POST /payments` — Create Midtrans payment transaction for an order
- `POST /payments/notification` — Midtrans webhook/callback (updates order status)

---

### Progress & Next Steps
- [x] All core backend endpoints implemented and tested
- [x] Midtrans payment integration (sandbox)
- [x] Order item CRUD with paid order protection
- [ ] Frontend integration (React, Redux, etc)
- [ ] Google login (OAuth)
- [ ] AI recommendation (OpenAI API)

If you need a new endpoint or feature, see the list above and open an issue or request.

## Testing
- Frontend: `npm test` (in `frontend`)
- Backend: `npm test` (in `backend`)

## License
MIT
