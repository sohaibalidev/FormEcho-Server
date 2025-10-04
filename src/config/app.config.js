/**
 * FormEcho Configuration
 * --------------------------
 * Centralized config values loaded from environment variables.
 */

require("dotenv").config({ quiet: true });

const APP_NAME = process.env.APP_NAME || "FormEcho";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

module.exports = {
  APP_NAME,
  PORT: process.env.PORT || 5000,
  BASE_URL: process.env.BASE_URL || "http://192.168.100.4:5000",
  CLIENT_URL: process.env.CLIENT_URL || "http://192.168.100.4:5173",
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGODB_URI: process.env.MONGODB_URI || "",

  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  COOKIE_EXPIRE: parseInt(process.env.COOKIE_EXPIRE, 10) || 30,
  MAX_AGE: parseInt(process.env.MAX_AGE, 10) || THIRTY_DAYS,

  EMAIL_HOST: process.env.EMAIL_HOST || "gmail",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  EMAIL_FROM: `${APP_NAME} <${process.env.EMAIL_USER}>`
};
