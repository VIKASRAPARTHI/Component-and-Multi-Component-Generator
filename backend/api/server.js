// Full server function (once minimal works)
const express = require('express');
const cors = require('cors');

const app = express();

// Simple CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Express backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple auth test
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint working',
    body: req.body
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;
