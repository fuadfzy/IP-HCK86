// Only load dotenv in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const menuItemsRouter = require('./routes/menuItems');
const sessionsRouter = require('./routes/sessions');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('💡 Please set these variables in your deployment environment');
  process.exit(1);
}

// Passport Google OAuth setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { google_id: profile.id } });
    if (!user) {
      user = await User.create({
        google_id: profile.id,
        name: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.BACKEND_URL]
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());


const authenticateJWT = require('./middleware/authenticateJWT');

// Health check (unprotected)
app.get('/', (req, res) => {
  res.json({ 
    status: 'TableTalk API is up and running. do your thing.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth route (unprotected)
app.use('/auth', require('./routes/auth'));

// Sessions route (unprotected - needed for QR code scanning)
app.use('/sessions', sessionsRouter);

// Payment redirect routes (unprotected - for Midtrans redirects)
app.use('/payment', require('./routes/paymentRedirect'));

// Protect all other API routes
app.use(authenticateJWT);
app.use('/menu-items', menuItemsRouter);
app.use('/orders', ordersRouter);
app.use('/payments', paymentsRouter);
app.use('/ai', require('./routes/ai'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  const url = process.env.NODE_ENV === 'production' 
    ? process.env.BACKEND_URL || `https://your-aws-app.com`
    : `http://localhost:${PORT}`;
  console.log(`🚀 TableTalk Backend server running at \x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
});
