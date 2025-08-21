# 📋 Supabase Connection Guide - Visual Steps

## 🎯 Where to Find Connection Details

### Step 1: Go to Settings → Database
```
Supabase Dashboard → Settings (gear icon) → Database
```

### Step 2: Find Connection Information

You'll see 3 sections on the page:

## 📍 Section 1: Database Settings (Direct Connection)
```
┌─────────────────────────────────────────┐
│ Database settings                        │
├─────────────────────────────────────────┤
│ Host     db.abcdefghijklmn.supabase.co  │
│ Database postgres                        │  
│ Port     5432                           │
│ User     postgres                       │
│ Password [click to reveal]               │
└─────────────────────────────────────────┘
```

**Copy this for development:**
```
DATABASE_URL=postgresql://postgres:[password]@db.abcdefghijklmn.supabase.co:5432/postgres
```

## 📍 Section 2: Connection Pooling - Transaction Mode
```
┌─────────────────────────────────────────┐
│ Connection pooling                       │
│ Transaction mode                         │
├─────────────────────────────────────────┤
│ Host     aws-0-region.pooler.supabase.com │
│ Database postgres                        │
│ Port     6543                           │
│ User     postgres.abcdefghijklmn        │
│ Password [your-same-password]            │
└─────────────────────────────────────────┘
```

**Copy this for production (RECOMMENDED):**
```
DATABASE_URL=postgresql://postgres.abcdefghijklmn:[password]@aws-0-region.pooler.supabase.com:6543/postgres
```

## 📍 Section 3: Connection Pooling - Session Mode
```
┌─────────────────────────────────────────┐
│ Connection pooling                       │
│ Session mode                             │
├─────────────────────────────────────────┤
│ Host     aws-0-region.pooler.supabase.com │
│ Database postgres                        │
│ Port     5432                           │
│ User     postgres.abcdefghijklmn        │
│ Password [your-same-password]            │
└─────────────────────────────────────────┘
```

**Copy this for complex transactions:**
```
DATABASE_URL=postgresql://postgres.abcdefghijklmn:[password]@aws-0-region.pooler.supabase.com:5432/postgres
```

## 🎯 Quick Copy Commands

### For Development:
```bash
# Replace 'abcdefghijklmn' with your actual project ref
# Replace '[password]' with your actual password
DATABASE_URL=postgresql://postgres:[password]@db.abcdefghijklmn.supabase.co:5432/postgres
```

### For Production (TableTalk):
```bash
# Replace 'abcdefghijklmn' with your actual project ref  
# Replace 'region' with your actual region (e.g., ap-southeast-1)
# Replace '[password]' with your actual password
DATABASE_URL=postgresql://postgres.abcdefghijklmn:[password]@aws-0-region.pooler.supabase.com:6543/postgres
```

## ⚠️ Important Notes:

1. **Password**: Same for all connection types
2. **Project Ref**: The random string after "postgres." in pooler connections
3. **Region**: Depends on where you created your project (e.g., us-east-1, ap-southeast-1)
4. **Port Differences**:
   - Direct: 5432
   - Transaction Pooler: 6543
   - Session Pooler: 5432

## 🔍 How to Identify Your Values:

1. **Project Ref**: Look at your project URL or the user field in pooler connections
2. **Region**: Check your project settings or the pooler host URL
3. **Password**: The one you generated when creating the project

## 💡 Pro Tip:
Copy the **Transaction Mode** connection string for production deployment to Railway. It handles the most connections and works best with REST APIs like TableTalk.
