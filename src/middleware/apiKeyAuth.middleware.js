const APIKey = require("../models/APIKey");
const User = require("../models/User");

const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key is required",
      });
    }

    const keyRecord = await APIKey.findOne({
      key: apiKey,
      status: "active",
    }).populate("userId");

    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    // Check if user is active
    if (!keyRecord.userId.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account suspended",
      });
    }

    // Reset monthly usage if needed
    await keyRecord.userId.resetMonthlyUsage();

    // Check monthly limits
    if (keyRecord.userId.currentMonthApiCalls >= keyRecord.requestsPerMonth) {
      return res.status(429).json({
        success: false,
        message: "Monthly request limit exceeded",
      });
    }

    req.apiKey = keyRecord;
    req.user = keyRecord.userId;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during API key validation",
    });
  }
};

module.exports = apiKeyAuth;
