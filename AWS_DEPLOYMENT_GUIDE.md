# AWS EC2 Deployment Guide - TableTalk API

## Prerequisites
- AWS Account
- Domain (optional for HTTPS)
- Supabase Database URL

## Step 1: Server App Configuration ✅
- ✅ Port changed to `process.env.PORT || 3000`
- ✅ Dotenv only in development
- ✅ Ecosystem config created

## Step 2: AWS EC2 Setup

### 2.1 Launch EC2 Instance
1. Go to AWS Console → EC2
2. Set Region: **Asia Pacific (Singapore) ap-southeast-1**
3. Launch Instance:
   - **Name**: `tabletalk-api-server`
   - **OS**: Ubuntu (free tier eligible)
   - **Instance Type**: t2.micro (free tier eligible)
   - **Key Pair**: Create new RSA .pem key pair (SAVE SAFELY!)
   - **Security Group**: Create new with:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (3000) - Anywhere

### 2.2 Connect to Instance
```bash
# Make key pair executable
chmod 400 your-key-pair.pem

# Connect via SSH
ssh -i "your-key-pair.pem" ubuntu@ec2-YOUR-IP.ap-southeast-1.compute.amazonaws.com
```

## Step 3: Server Setup

### 3.1 Install Node.js
```bash
# Switch to root
sudo su

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Clone & Setup Application
```bash
# Clone repository
git clone https://github.com/fuadfzy/IP-HCK86.git
cd IP-HCK86

# Switch to backend directory
cd backend

# Install dependencies
npm install
```

### 3.3 Database Migration
```bash
# Set database URL (use your actual Supabase URL)
export DATABASE_URL="[YOUR_SUPABASE_DATABASE_URL]"

# Run migrations
npx sequelize-cli db:migrate --env=production

# Run seeders
npx sequelize-cli db:seed:all --env=production
```

### 3.4 Install & Configure PM2
```bash
# Install PM2 globally
npm install -g pm2

# Update ecosystem.config.js with your actual values
vi ecosystem.config.js

# Replace ALL placeholders with actual values from your .env file:
# [YOUR_SUPABASE_DATABASE_URL] = Your Supabase PostgreSQL connection string
# [YOUR_JWT_SECRET] = Your JWT secret key
# [YOUR_GOOGLE_CLIENT_ID] = Your Google OAuth Client ID
# [YOUR_GOOGLE_CLIENT_SECRET] = Your Google OAuth Client Secret
# [YOUR_MIDTRANS_SERVER_KEY] = Your Midtrans Server Key
# [YOUR_MIDTRANS_CLIENT_KEY] = Your Midtrans Client Key
# [YOUR_OPENAI_API_KEY] = Your OpenAI API Key
# [YOUR_AWS_IP] = Your actual AWS EC2 public IP

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 4: Environment Variables Configuration

After getting your AWS IP address, update `ecosystem.config.js` with actual values:

```javascript
// Example configuration (replace with your actual values from backend/.env):
DATABASE_URL: "[YOUR_SUPABASE_DATABASE_URL]"
JWT_SECRET: "[YOUR_JWT_SECRET]"
GOOGLE_CLIENT_ID: "[YOUR_GOOGLE_CLIENT_ID]"
GOOGLE_CLIENT_SECRET: "[YOUR_GOOGLE_CLIENT_SECRET]"
GOOGLE_CALLBACK_URL: "http://[YOUR_ACTUAL_AWS_IP]/auth/google/callback"
MIDTRANS_SERVER_KEY: "[YOUR_MIDTRANS_SERVER_KEY]"
MIDTRANS_CLIENT_KEY: "[YOUR_MIDTRANS_CLIENT_KEY]"
OPENAI_API_KEY: "[YOUR_OPENAI_API_KEY]"
FRONTEND_URL: "http://[YOUR_ACTUAL_AWS_IP]"
```

⚠️ **Security Note**: Never commit actual API keys to Git. Use the values from your backend/.env file.

## Step 5: Google OAuth Configuration

Update Google Cloud Console:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Update OAuth 2.0 Client:
   - **Authorized JavaScript origins**: 
     - `http://YOUR_AWS_IP`
   - **Authorized redirect URIs**: 
     - `http://YOUR_AWS_IP/auth/google/callback`

## Step 6: Test Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs

# Test API endpoint
curl http://YOUR_AWS_IP/health
```

## Step 7: Optional - Setup HTTPS with Let's Encrypt

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Configure Nginx proxy
sudo nano /etc/nginx/sites-available/default
```

## Important Notes:

1. **Security Group**: Make sure ports 80, 443, and 3000 are open
2. **Environment Variables**: All secrets are in PM2 ecosystem config
3. **Database**: Using Supabase PostgreSQL (already configured)
4. **Domain**: Get a domain for HTTPS setup
5. **Backup**: Save your .pem key file safely

## Troubleshooting:

- Check PM2 logs: `pm2 logs`
- Restart application: `pm2 restart all`
- Check port usage: `netstat -tulpn | grep :80`
- Check Nginx status: `sudo systemctl status nginx`
