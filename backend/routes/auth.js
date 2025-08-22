const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), async (req, res) => {
  // User info is in req.user
  const user = req.user;
  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  // Redirect to frontend with token and user data
  const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://tabletalk-2025.web.app' : 'http://localhost:5173';
  const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, name: user.name, email: user.email }))}`;
  
  res.redirect(redirectUrl);
});

module.exports = router;
