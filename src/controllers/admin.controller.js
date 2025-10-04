const User = require("../models/User");
const APIKey = require("../models/APIKey");
const FormSubmission = require("../models/FormSubmission");

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { email: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    // Add usage statistics
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const apiKeys = await APIKey.find({ userId: user._id });
        const submissions = await FormSubmission.countDocuments({
          userId: user._id,
        });

        return {
          ...user.toObject(),
          apiKeysCount: apiKeys.length,
          totalSubmissions: submissions,
          activeKeys: apiKeys.filter((key) => key.status === "active").length,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// @desc    Update user status (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { paidStatus, isActive, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (paidStatus !== undefined) user.paidStatus = paidStatus;
    if (isActive !== undefined) user.isActive = isActive;
    if (role !== undefined) user.role = role;

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

// @desc    Get platform statistics (admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await FormSubmission.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const paidUsers = await User.countDocuments({ paidStatus: true });

    const recentSubmissions = await FormSubmission.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const tierStats = await User.aggregate([
      {
        $lookup: {
          from: "apikeys",
          localField: "_id",
          foreignField: "userId",
          as: "apiKeys",
        },
      },
      {
        $unwind: "$apiKeys",
      },
      {
        $group: {
          _id: "$apiKeys.tier",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSubmissions,
        activeUsers,
        paidUsers,
        recentSubmissions,
        tierStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
    });
  }
};

// @desc    Get all submissions (admin only)
// @route   GET /api/admin/submissions
// @access  Private/Admin
const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    const submissions = await FormSubmission.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "email")
      .populate("apiKeyId", "name key");

    const total = await FormSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
    });
  }
};

module.exports = {
  getUsers,
  updateUser,
  getStats,
  getAllSubmissions,
};
