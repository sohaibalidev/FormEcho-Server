const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    key: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    tier: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    requestsCount: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
    },
    requestsPerMonth: {
      type: Number,
      default: 100,
    },
    emailsPerMonth: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
    name: {
      type: String,
      default: "Default Key",
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUsed timestamp
apiKeySchema.methods.updateUsage = function () {
  this.requestsCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model("APIKey", apiKeySchema);
