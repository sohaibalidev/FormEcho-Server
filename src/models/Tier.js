const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      required: true,
      unique: true,
    },
    calls: {
      type: Number,
      default: 0,
    },
    callsPerMonth: {
      type: Number,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

tierSchema.statics.initializeTiers = async function () {
  const tiers = [
    {
      name: 'free',
      callsPerMonth: 100,
      features: [
        'Basic Form Handling',
        'Email Notifications',
        '30-day History',
      ],
    },
    {
      name: 'pro',
      callsPerMonth: 1000,
      features: [
        'Advanced Form Handling',
        'Priority Support',
        'Webhook Support',
        '90-day History',
      ],
    },
    {
      name: 'enterprise',
      callsPerMonth: 10000,
      features: [
        'Unlimited Forms',
        'Custom Domains',
        'API Access',
        'Dedicated Support',
        '1-year History',
      ],
    },
  ];

  for (const tierData of tiers) {
    await this.findOneAndUpdate({ name: tierData.name }, tierData, {
      upsert: true,
      new: true,
    });
  }
};

module.exports = mongoose.model('Tier', tierSchema);
