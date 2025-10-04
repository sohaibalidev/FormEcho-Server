const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email);
        },
        message: 'Please enter a valid email',
      },
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    tier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    joinedOn: {
      type: Date,
      default: Date.now,
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

userSchema.methods.updateTier = async function (tierName) {
  const Tier = mongoose.model('Tier');
  const tierData = await Tier.findOne({ name: tierName });

  if (tierData) {
    this.tier = tierName;
    return this.save();
  }
};

module.exports = mongoose.model('User', userSchema);
