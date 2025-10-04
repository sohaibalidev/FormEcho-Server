const APIKey = require('../models/APIKey');
const Tier = require('../models/Tier');

exports.getAPIKey = async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ userId: req.user.id });

    res.json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API key',
    });
  }
};

exports.createAPIKey = async (req, res) => {
  try {
    const { name, tier = 'free' } = req.body;

    const existingApiKey = await APIKey.findOne({ userId: req.user.id });
    if (existingApiKey) {
      return res.status(400).json({
        success: false,
        message: 'User already has an API key. Use update instead.',
      });
    }

    const tierData = await Tier.findOne({ name: tier });
    if (!tierData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier',
      });
    }

    const apiKey = await APIKey.create({
      userId: req.user.id,
      name,
      tier,
      requestsPerMonth: tierData.requestsPerMonth,
      emailsPerMonth: tierData.emailsPerMonth,
    });

    res.status(201).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating API key',
    });
  }
};

exports.updateAPIKey = async (req, res) => {
  try {
    const { name, tier, action } = req.body;

    let apiKey = await APIKey.findOne({ userId: req.user.id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    if (tier) {
      const tierData = await Tier.findOne({ name: tier });
      if (!tierData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tier',
        });
      }

      apiKey.tier = tier;
      apiKey.requestsPerMonth = tierData.requestsPerMonth;
      apiKey.emailsPerMonth = tierData.emailsPerMonth;
    }

    if (name) {
      apiKey.name = name;
    }

    if (action) {
      switch (action) {
        case 'regenerate':
          const { v4: uuidv4 } = require('uuid');
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
            message: "Invalid action. Use 'regenerate', 'revoke', or 'activate'",
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
    res.status(500).json({
      success: false,
      message: 'Error updating API key',
    });
  }
};

exports.getAPIKeyUsage = async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ userId: req.user.id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    const usage = {
      requestsCount: apiKey.requestsCount,
      requestsPerMonth: apiKey.requestsPerMonth,
      remainingRequests: apiKey.requestsPerMonth - apiKey.requestsCount,
      emailsPerMonth: apiKey.emailsPerMonth,
      lastUsed: apiKey.lastUsed,
      tier: apiKey.tier,
      status: apiKey.status,
    };

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API key usage',
    });
  }
};

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
