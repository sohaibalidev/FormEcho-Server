const mongoose = require("mongoose");

const tierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      required: true,
      unique: true,
    },
    requestsPerMonth: {
      type: Number,
      required: true,
    },
    emailsPerMonth: {
      type: Number,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to create default tiers
tierSchema.statics.initializeTiers = async function () {
  const tiers = [
    {
      name: "free",
      requestsPerMonth: 100,
      emailsPerMonth: 50,
      features: [
        "Basic Form Handling",
        "Email Notifications",
        "30-day History",
      ],
      price: 0,
    },
    {
      name: "pro",
      requestsPerMonth: 1000,
      emailsPerMonth: 500,
      features: [
        "Advanced Form Handling",
        "Priority Support",
        "Webhook Support",
        "90-day History",
      ],
      price: 19,
    },
    {
      name: "enterprise",
      requestsPerMonth: 10000,
      emailsPerMonth: 5000,
      features: [
        "Unlimited Forms",
        "Custom Domains",
        "API Access",
        "Dedicated Support",
        "1-year History",
      ],
      price: 99,
    },
  ];

  for (const tierData of tiers) {
    await this.findOneAndUpdate({ name: tierData.name }, tierData, {
      upsert: true,
      new: true,
    });
  }
};

module.exports = mongoose.model("Tier", tierSchema);
