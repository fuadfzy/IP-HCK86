const express = require('express');
const router = express.Router();

// Frontend base URL for redirection (prefer env, fallback by environment)
const FRONTEND_URL = process.env.FRONTEND_URL
  || (process.env.NODE_ENV === 'test' ? 'http://localhost:5173' : 'https://tabletalk-2025.web.app');

// Payment redirect handlers - serve simple HTML pages
router.get('/finish', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Processing</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <div style="text-align: center; padding: 50px;">
        <h2>Processing Payment Result...</h2>
        <script>
          // Redirect to frontend with payment data
          const params = new URLSearchParams(window.location.search);
          const frontendUrl = '${FRONTEND_URL}/payment/finish?' + params.toString();
          window.location.replace(frontendUrl);
        </script>
      </div>
    </body>
    </html>
  `);
});

router.get('/unfinish', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <div style="text-align: center; padding: 50px;">
        <h2>Payment Cancelled</h2>
        <script>
          // Redirect to frontend with payment data
          const params = new URLSearchParams(window.location.search);
          const frontendUrl = '${FRONTEND_URL}/payment/unfinish?' + params.toString();
          window.location.replace(frontendUrl);
        </script>
      </div>
    </body>
    </html>
  `);
});

router.get('/error', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Error</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <div style="text-align: center; padding: 50px;">
        <h2>Payment Error</h2>
        <script>
          // Redirect to frontend with payment data
          const params = new URLSearchParams(window.location.search);
          const frontendUrl = '${FRONTEND_URL}/payment/error?' + params.toString();
          window.location.replace(frontendUrl);
        </script>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
