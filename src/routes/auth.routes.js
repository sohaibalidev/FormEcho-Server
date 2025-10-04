const express = require("express");
const {
  register,
  login,
  requestMagicLink,
  verifyMagicLink,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
} = require("../controllers/auth.controller");

const { protect, guest } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/register", authLimiter, guest, register);
router.post("/login", authLimiter, guest, login);
router.post("/magic-link", authLimiter, guest, requestMagicLink);
router.get("/verify", verifyMagicLink);
router.post("/forgot-password", authLimiter, guest, forgotPassword);
router.post("/reset-password", authLimiter, guest, resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
