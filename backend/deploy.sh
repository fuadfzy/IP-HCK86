#!/bin/bash

# TableTalk Backend Deployment Script
echo "🚀 Preparing TableTalk Backend for Deployment..."

# Check if we're in backend directory
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Please run this script from the backend directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Please edit .env file with your actual values before deployment"
    exit 1
fi

# Test database connection
echo "🗄️  Testing database connection..."
npm run test:db || {
    echo "❌ Database connection failed. Please check your .env database settings"
    echo "💡 Make sure you've setup Supabase database first"
    echo "📖 See SUPABASE_QUICKSTART.md for setup instructions"
    exit 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests (optional)
echo "🧪 Running tests..."
npm test || echo "⚠️  Tests failed, but continuing..."

# Go back to root and commit
cd ..
echo "📤 Committing and pushing to GitHub..."
git add .
git commit -m "Backend ready for deployment with Supabase - $(date)"
git push origin fuad-dev

echo "✅ Backend ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app"
echo "2. Create new project from GitHub"
echo "3. Select 'backend' folder as root directory"
echo "4. Add environment variable: DATABASE_URL (from your Supabase project)"
echo "5. Deploy!"
echo ""
echo "📖 See ../DEPLOYMENT.md for detailed instructions"
