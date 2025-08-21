module.exports = {
  apps: [{
    name: "TableTalk API",
    script: "./server.js",
    env: {
      NODE_ENV: "production",
      PORT: 80,
      DATABASE_URL: "[YOUR_SUPABASE_DATABASE_URL]",
      JWT_SECRET: "[YOUR_JWT_SECRET]",
      GOOGLE_CLIENT_ID: "[YOUR_GOOGLE_CLIENT_ID]",
      GOOGLE_CLIENT_SECRET: "[YOUR_GOOGLE_CLIENT_SECRET]",
      GOOGLE_CALLBACK_URL: "http://[YOUR_AWS_IP]/auth/google/callback",
      MIDTRANS_SERVER_KEY: "[YOUR_MIDTRANS_SERVER_KEY]",
      MIDTRANS_CLIENT_KEY: "[YOUR_MIDTRANS_CLIENT_KEY]",
      OPENAI_API_KEY: "[YOUR_OPENAI_API_KEY]",
      FRONTEND_URL: "http://[YOUR_AWS_IP]"
    }
  }]
};
