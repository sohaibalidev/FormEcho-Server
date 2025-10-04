const rateLimit = require("express-rate-limit");

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
});

// API key rate limiter
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each API key to 60 requests per minute
  keyGenerator: (req) => req.headers["x-api-key"] || req.ip,
  message: {
    success: false,
    message: "Too many requests with this API key, please try again later",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiKeyLimiter,
};
