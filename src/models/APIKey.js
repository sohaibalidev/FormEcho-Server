const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    lastUsed: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    name: {
      type: String,
      default: 'My API Key',
    },
  },
  {
    timestamps: true,
  }
);

apiKeySchema.methods.updateUsage = function () {
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('APIKey', apiKeySchema);
