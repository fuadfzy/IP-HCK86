# 🚀 TableTalk Backend Deployment Guide

## Project Structure
```
IP-HCK86-clone/
├── backend/          # 🎯 Deploy this folder
│   ├── server.js
│   ├── package.json
│   ├── railway.json
│   ├── Procfile
│   ├── .env.example
│   ├── deploy.sh
│   └── README.md
├── frontend/         # Separate deployment
└── LECTURE-REDUX/    # Learning materials
```

**Important**: Deploy the `backend/` folder only, not the entire repository.

## Prerequisites
1. **GitHub repository** - Your code should be pushed to GitHub
2. **Railway account** - Sign up at [railway.app](https://railway.app)
3. **PostgreSQL database** - Railway provides free PostgreSQL
4. **Environment variables** - Copy from `.env.example`

---

## 🛠️ Option 1: Railway Deployment (Recommended)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Authorize Railway to access your repositories

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `fuadfzy/IP-HCK86`
4. **IMPORTANT**: Set **Root Directory** to `backend`
5. Railway will detect the Node.js project in backend folder

### Step 3: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will create a database instance
4. Note the database connection details

### Step 4: Configure Environment Variables
1. Go to your service → **"Variables"** tab
2. Add all variables from `.env.example`:

```env
# Database (use Railway PostgreSQL connection details)
DB_HOST=your-railway-postgres-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASS=your-railway-db-password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.railway.app/auth/google/callback

# Payment
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# AI
OPENAI_API_KEY=your-openai-api-key

# URLs
BACKEND_URL=https://your-app.railway.app
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001
NODE_ENV=production
```

### Step 5: Deploy
1. Railway will automatically deploy when you push to GitHub
2. Check deployment logs for any errors
3. Your API will be available at: `https://your-app.railway.app`

### Step 6: Run Database Migrations
1. In Railway dashboard → **"Deployments"** tab
2. Click on latest deployment → **"View Logs"**
3. Or use Railway CLI:
```bash
railway login
railway link
railway run npm run db:migrate
railway run npm run db:seed
```

---

## 🛠️ Option 2: Render Deployment

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### Step 3: Add PostgreSQL Database
1. Create **"New +"** → **"PostgreSQL"**
2. Note the connection details

### Step 4: Environment Variables
Add the same variables as Railway example above.

---

## 🛠️ Option 3: Manual VPS Deployment

### Step 1: Setup VPS (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Setup Database
```bash
sudo -u postgres createuser --interactive
sudo -u postgres createdb tabletalk_db
```

### Step 3: Deploy Application
```bash
# Clone repository
git clone https://github.com/fuadfzy/IP-HCK86.git
cd IP-HCK86

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run db:migrate
npm run db:seed

# Start with PM2
pm2 start backend/server.js --name "tabletalk-api"
pm2 startup
pm2 save
```

---

## 🔧 Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.railway.app/

# Expected response:
{
  "status": "TableTalk API is up and running. do your thing.",
  "timestamp": "2025-08-21T...",
  "environment": "production"
}

# Test Google OAuth
curl https://your-domain.railway.app/auth/google

# Test sessions (no auth needed)
curl -X POST https://your-domain.railway.app/sessions \
  -H "Content-Type: application/json" \
  -d '{"qr_code": "TEST-QR-001"}'
```

---

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Update CORS origins for production
3. **HTTPS**: Use HTTPS for all external APIs
4. **Database**: Use strong passwords
5. **JWT Secret**: Use cryptographically secure random string

---

## 📊 Monitoring

### Railway Monitoring
- Built-in metrics and logs
- Real-time deployment status
- Resource usage tracking

### Custom Health Check
The API includes health check endpoint at `/` for monitoring tools.

---

## 🔄 CI/CD Pipeline

Railway automatically deploys when you push to GitHub:

```bash
# Deploy new changes
git add .
git commit -m "Update feature"
git push origin main
# Railway will automatically deploy
```

---

## 📞 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL in environment variables
   - Ensure database is running

2. **Google OAuth Error**
   - Verify GOOGLE_CALLBACK_URL matches your domain
   - Check Google Console configuration

3. **Midtrans Webhook Failed**
   - Update webhook URL in Midtrans dashboard
   - Use HTTPS URLs for production

4. **Port Issues**
   - Railway automatically assigns PORT
   - Don't hardcode port in production

### Logs:
```bash
# Railway CLI
railway logs

# PM2 (VPS)
pm2 logs tabletalk-api
```

---

## 🎯 Next Steps

1. **Deploy Frontend** (Vercel/Netlify)
2. **Configure Custom Domain**
3. **Setup SSL Certificate**
4. **Configure Monitoring/Alerts**
5. **Setup Backup Strategy**
