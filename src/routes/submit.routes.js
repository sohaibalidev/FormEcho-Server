const express = require("express");
const { submitForm } = require("../controllers/submission.controller");
const apiKeyAuth = require("../middleware/apiKeyAuth.middleware");
const { apiKeyLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/submit", apiKeyLimiter, apiKeyAuth, submitForm);

module.exports = router;
