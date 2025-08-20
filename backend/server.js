require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const menuItemsRouter = require('./routes/menuItems');
const tablesRouter = require('./routes/tables');
const sessionsRouter = require('./routes/sessions');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const orderItemsRouter = require('./routes/orderItems');

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
app.use(cors());
app.use(express.json());
app.use(passport.initialize());


const authenticateJWT = require('./middleware/authenticateJWT');

// Auth route (unprotected)
app.use('/auth', require('./routes/auth'));

// Protect all other API routes
app.use(authenticateJWT);
app.use('/menu-items', menuItemsRouter);
app.use('/tables', tablesRouter);
app.use('/sessions', sessionsRouter);
app.use('/orders', ordersRouter);
app.use('/payments', paymentsRouter);
app.use('/order-items', orderItemsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Backend server running at \x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`);
});
