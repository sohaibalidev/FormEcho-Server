/**

* Express Application Setup
* ---
* Handles:
* * Core Express app initialization
* * Global middleware registration
* * Security & CORS configuration
* * API route mounting
* * Health check
* * Centralized 404 & error handling
    */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet ');
const cookieParser = require('cookie-parser');

const { generalLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes/index.routes');
const config = require('./config/app.config');

const app = express();

/* ===========================
GLOBAL MIDDLEWARES
=========================== */

// Security headers
if (config.NODE_ENV !== 'development') {
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
}

// Rate limiter
app.use(generalLimiter);

// CORS (allow frontend to communicate with API)
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

/* ===========================
API ROUTES
=========================== */
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FormEcho API is running',
    timestamp: new Date().toISOString(),
  });
});

/* ===========================
404 HANDLER
=========================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ===========================
GLOBAL ERROR HANDLER
=========================== */
app.use((err, req, res, next) => {
  if (config.NODE_ENV === 'development') console.error('Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
