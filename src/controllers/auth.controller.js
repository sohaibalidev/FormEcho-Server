const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendMagicLink, sendPasswordReset } = require("../utils/email");
const { generateToken, sendTokenResponse } = require("../utils/generateToken");
const config = require("../config/app.config");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });

    const userCount = await User.countDocuments();
    if (userCount === 1) {
      user.role = "admin";
      await user.save();
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

exports.requestMagicLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "15m",
    });
    await sendMagicLink(email, token);

    res.json({
      success: true,
      message: "Magic link sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error sending magic link",
    });
  }
};

exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Magic link has expired",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error verifying magic link",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = generateToken(user._id);
    await sendPasswordReset(email, resetToken);

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error sending reset email",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
