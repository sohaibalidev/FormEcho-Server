const APIKey = require('../models/APIKey');
const User = require('../models/User');
const Tier = require('../models/Tier');
const { v4: uuidv4 } = require('uuid');

const MAX_KEYS_PER_USER = 5;

exports.createAPIKey = async (req, res) => {
  try {
    const { name } = req.body;

    const count = await APIKey.countDocuments({ userId: req.user.id });
    if (count >= MAX_KEYS_PER_USER) {
      return res.status(400).json({
        success: false,
        message: `You can only create up to ${MAX_KEYS_PER_USER} API keys.`,
      });
    }

    const apiKey = await APIKey.create({
      userId: req.user.id,
      name: name || 'My API Key',
    });

    res.status(201).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating API key',
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const apiKeys = await APIKey.find({ userId: req.user.id });

    const tier = await Tier.findOne({ name: user.tier });
    if (!tier) {
      return res.status(500).json({
        success: false,
        message: 'Tier configuration not found',
      });
    }

    const totalKeys = apiKeys.length;
    const activeKeys = apiKeys.filter((k) => k.status === 'active').length;
    const revokedKeys = apiKeys.filter((k) => k.status === 'revoked').length;

    const totalCallsUsed = getUserCurrentMonthUsage(user._id);
    const totalCallsAllowed = tier.callsPerMonth;
    const remainingCalls = Math.max(0, totalCallsAllowed - totalCallsUsed);

    const lastUsedKey = apiKeys
      .filter((k) => k.lastUsed)
      .sort((a, b) => b.lastUsed - a.lastUsed)[0];

    const stats = {
      totalKeys,
      activeKeys,
      revokedKeys,
      tier: user.tier,
      totalCallsAllowed,
      totalCallsUsed,
      remainingCalls,
      lastUsed: lastUsedKey ? lastUsedKey.lastUsed : null,
      usagePercentage:
        totalCallsAllowed > 0
          ? Math.round((totalCallsUsed / totalCallsAllowed) * 100)
          : 0,
      features: tier.features,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API stats',
    });
  }
};

exports.getAPIKeys = async (req, res) => {
  try {
    const apiKeys = await APIKey.find({ userId: req.user.id });

    res.json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API keys',
    });
  }
};

exports.updateAPIKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, action } = req.body;

    let apiKey = await APIKey.findOne({ _id: id, userId: req.user.id });
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    if (name) {
      apiKey.name = name;
    }

    if (action) {
      switch (action) {
        case 'regenerate':
          apiKey.key = uuidv4();
          apiKey.status = 'active';
          break;
        case 'revoke':
          apiKey.status = 'revoked';
          break;
        case 'activate':
          apiKey.status = 'active';
          break;
        default:
          return res.status(400).json({
            success: false,
            message:
              "Invalid action. Use 'regenerate', 'revoke', or 'activate'",
          });
      }
    }

    await apiKey.save();

    res.json({
      success: true,
      data: apiKey,
      message: getActionMessage(action),
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating API key',
    });
  }
};

exports.updateUserTier = async (req, res) => {
  try {
    const { tier } = req.body;

    // Validate the tier exists
    const tierData = await Tier.findOne({ name: tier });
    if (!tierData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier specified',
      });
    }

    const user = await User.findById(req.user.id);
    await user.updateTier(tier);

    res.json({
      success: true,
      message: `Tier updated to ${tier} successfully`,
      data: {
        tier: user.tier,
        monthlyCallsLimit: tierData.callsPerMonth,
        features: tierData.features,
      },
    });
  } catch (error) {
    console.error('Error updating user tier:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user tier',
    });
  }
};

async function getUserCurrentMonthUsage(userId) {
  // Implement actual usage tracking, this could query a separate usage collection that tracks API calls per user per month
  return 0;
}

const getActionMessage = (action) => {
  switch (action) {
    case 'regenerate':
      return 'API key regenerated successfully';
    case 'revoke':
      return 'API key revoked successfully';
    case 'activate':
      return 'API key activated successfully';
    default:
      return 'API key updated successfully';
  }
};
