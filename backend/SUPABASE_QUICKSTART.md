# 🚀 Quick Supabase Setup for TableTalk

## Step 1: Create Supabase Database (5 minutes)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up** with GitHub
3. **New Project**: 
   - Name: `tabletalk-db`
   - Generate strong password (SAVE IT!)
   - Region: Choose closest to you
   - Plan: Free tier
4. **Wait 2 minutes** for setup

## Step 2: Get Connection Details

In Supabase Dashboard → **Settings** → **Database**:

### Option A: Direct Connection (Development)
**Database Settings section**:
```
Host: db.xxxxxxxxxxxx.supabase.co
Database: postgres  
Port: 5432
User: postgres
Password: [your-generated-password]
```

**URI Format**:
```
postgresql://postgres:[password]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### Option B: Connection Pooling (Production Recommended)
**Connection Pooling section**:

1. **Transaction Mode (Recommended for most apps)**:
   ```
   Host: aws-0-[region].pooler.supabase.com
   Database: postgres
   Port: 6543
   User: postgres.[ref]
   Password: [your-password]
   
   URI: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

2. **Session Mode (For complex transactions)**:
   ```
   Host: aws-0-[region].pooler.supabase.com
   Database: postgres
   Port: 5432
   User: postgres.[ref]
   Password: [your-password]
   
   URI: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

### Which Connection to Choose?

- **Direct Connection**: Development only (limited to 60 connections)
- **Transaction Pooler (Port 6543)**: ✅ **Best for production APIs** - handles most SQL operations
- **Session Pooler (Port 5432)**: For apps that need prepared statements/complex transactions

## Step 3: Update Your Local .env

Edit `backend/.env`:

### Option A: Development (Direct Connection)
```bash
# Comment out local database
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=restaurant_ordering
# DB_USER=postgres
# DB_PASS=yourpassword

# Supabase Direct Connection (Development)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxx.supabase.co:5432/postgres

# Keep other settings
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
# ... etc
```

### Option B: Production (Transaction Pooler) - RECOMMENDED
```bash
# Supabase Transaction Pooler (Production)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Or you can use individual fields:
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.[ref]
DB_PASS=[your-password]
```

### Option C: Session Pooler (Complex Transactions)
```bash
# Supabase Session Pooler
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**For TableTalk, use Transaction Pooler (Option B) for best performance.**

## Step 4: Test Connection

```bash
cd backend

# Test database connection
npm run test:db

# If successful, run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

## Step 5: Verify in Supabase

1. Go to Supabase **Table Editor**
2. You should see these tables:
   - Users
   - Tables  
   - Sessions
   - MenuItems
   - Orders
   - OrderItems

## Step 6: Test API

```bash
# Start backend
npm run dev

# Test health check
curl http://localhost:3001/

# Should return: "TableTalk API is up and running..."
```

## ✅ Ready for Production!

Your database is now in the cloud and ready for deployment to Railway.

### For Railway Deployment:

**Environment Variables to add in Railway:**

```env
# Use Transaction Pooler for production
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Other required variables
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
```

## 📊 Connection Comparison

| Connection Type | Use Case | Port | Max Connections | Best For |
|----------------|----------|------|----------------|----------|
| **Direct** | Development | 5432 | 60 | Local development |
| **Transaction Pooler** | Production APIs | 6543 | 200+ | REST APIs, TableTalk ✅ |
| **Session Pooler** | Complex apps | 5432 | 200+ | Apps with prepared statements |

**Recommendation**: Use **Transaction Pooler** for TableTalk production deployment.

## 🆘 Troubleshooting

**Connection failed?**
- Check password is correct
- Make sure you copied the full connection string
- Try connection pooling URL from Supabase

**Need help?** See full guide in `SUPABASE_SETUP.md`
