const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.guest = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-passwordHash");

        if (user) {
          return res.status(403).json({
            success: false,
            message: "Already authenticated, guests only",
          });
        }
      } catch (error) {
        // Token is invalid/expired, allow to proceed as guest
      }
    }

    next();
  } catch (error) {
    console.error("Error in guest middleware:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
};
