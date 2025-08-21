# 🗄️ Supabase Database Setup for TableTalk

## Step 1: Create Supabase Account & Project

1. **Go to Supabase**
   - Visit [supabase.com](https://supabase.com)
   - Sign up with GitHub account

2. **Create New Project**
   - Click "New Project"
   - **Organization**: Choose your organization
   - **Name**: `tabletalk-db`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier (good for development/small apps)

3. **Wait for Setup**
   - Project creation takes ~2 minutes
   - You'll get a PostgreSQL database automatically

## Step 2: Get Database Connection Details

After project is created, go to **Settings** → **Database**:

### Direct Connection (Development Only)
Found in **Database settings** section:
```env
Host: db.xxxxxxxxxxxx.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [your-generated-password]

# Connection String:
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### Connection Pooling (Production Recommended)
Found in **Connection pooling** section:

#### Transaction Mode (Port 6543) - RECOMMENDED FOR TABLETALK
```env
Host: aws-0-[region].pooler.supabase.com
Database: postgres
Port: 6543
User: postgres.[ref]
Password: [your-password]

# Connection String:
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

#### Session Mode (Port 5432) - For Complex Transactions
```env
Host: aws-0-[region].pooler.supabase.com
Database: postgres
Port: 5432
User: postgres.[ref]
Password: [your-password]

# Connection String:
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Which Connection Should You Use?

| Connection Type | Max Connections | Best For | Recommended For TableTalk |
|----------------|----------------|----------|---------------------------|
| **Direct Connection** | 60 | Development, small apps | ❌ Development only |
| **Transaction Pooler** | 200+ | REST APIs, most web apps | ✅ **Yes - Production** |
| **Session Pooler** | 200+ | Apps with prepared statements | ❌ Not needed for our use case |

**For TableTalk: Use Transaction Pooler (Port 6543) for production deployment.**

## Step 3: Update Backend Configuration

### Option A: Direct Connection String (Simple)
Add to your `backend/.env`:
```env
# Supabase Database - Direct Connection (Development)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxx.supabase.co:5432/postgres

# Individual fields (optional, for development)
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[your-generated-password]
```

### Option B: Transaction Pooling (Recommended for Production)
```env
# Supabase Database - Transaction Pooler (Production)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Individual fields (if needed)
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.[ref]
DB_PASS=[your-generated-password]
```

### Option C: Session Pooling (For Complex Apps)
```env
# Supabase Database - Session Pooler
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Individual fields
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.[ref]
DB_PASS=[your-generated-password]
```

**For TableTalk Production: Use Option B (Transaction Pooler)**

## Step 4: Test Local Connection

Update your local `backend/.env` with Supabase credentials:

```bash
cd backend

# Test connection
npm run db:migrate

# If successful, seed data
npm run db:seed
```

## Step 5: Verify Database

1. **In Supabase Dashboard**:
   - Go to **Table Editor**
   - You should see your tables: Users, Tables, Sessions, MenuItems, Orders, OrderItems

2. **Test API locally**:
   ```bash
   npm run dev
   
   # Test endpoint that uses database
   curl http://localhost:3001/menu-items \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Step 6: Update Environment for Production

### For Railway Deployment:
Add these environment variables in Railway:

```env
# Database
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[your-supabase-password]

# OR use connection pooling
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.[ref]
DB_PASS=[your-supabase-password]

# Keep other variables
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
# ... etc
```

## Step 7: Database Migrations on Production

After deploying to Railway:

### Option A: Railway CLI
```bash
railway login
railway link [your-project]
railway run npm run db:migrate
railway run npm run db:seed
```

### Option B: Manual SQL in Supabase
1. Go to Supabase **SQL Editor**
2. Run migration SQL manually
3. Run seed SQL manually

## 🔒 Security Best Practices

### 1. Enable Row Level Security (RLS)
In Supabase **Authentication** → **Policies**:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItems" ENABLE ROW LEVEL SECURITY;

-- Create policies (example for Orders)
CREATE POLICY "Users can view own orders" ON "Orders"
  FOR SELECT USING (auth.uid()::text = "user_id"::text);
```

### 2. Database Backup
- Supabase automatically backs up your database
- Go to **Settings** → **Database** → **Backups** to configure

### 3. Connection Limits
- Free tier: 60 concurrent connections
- Use connection pooling for production
- Monitor usage in dashboard

## 🧪 Testing Database

### Test Script
Create `backend/test-db.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await sequelize.query('SELECT NOW()');
    console.log('✅ Current time:', result[0][0].now);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run test:
```bash
node test-db.js
```

## 📊 Monitoring

### Supabase Dashboard
- **Database** → **Usage**: Monitor connections, queries
- **Logs** → **Database**: View query logs
- **Reports**: Performance metrics

### Connection Health Check
Add to your `backend/server.js`:

```javascript
// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'Database connection healthy' });
  } catch (error) {
    res.status(500).json({ status: 'Database connection failed', error: error.message });
  }
});
```

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Use connection pooling URL
   - Check firewall settings

2. **SSL Required**
   - Add SSL config in Sequelize options

3. **Too Many Connections**
   - Use connection pooling
   - Implement connection limits

4. **Migration Fails**
   - Check table permissions
   - Run migrations manually in Supabase SQL Editor

### Migration to Supabase Checklist:
- [ ] Create Supabase project
- [ ] Get connection details
- [ ] Update local `.env`
- [ ] Test connection locally
- [ ] Run migrations locally
- [ ] Update production environment variables
- [ ] Deploy backend
- [ ] Run migrations on production
- [ ] Test production API
- [ ] Monitor database usage

Your database is now production-ready with Supabase! 🚀
