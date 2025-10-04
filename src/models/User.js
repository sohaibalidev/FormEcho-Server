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
    paidStatus: {
      type: Boolean,
      default: false,
    },
    joinedOn: {
      type: Date,
      default: Date.now,
    },
    nextPaymentDate: {
      type: Date,
      default: function () {
        const date = new Date(this.joinedOn);
        date.setMonth(date.getMonth() + 1);
        return date;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalApiCalls: {
      type: Number,
      default: 0,
    },
    currentMonthApiCalls: {
      type: Number,
      default: 0,
    },
    lastApiCallReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.resetMonthlyUsage = function () {
  const now = new Date();
  const lastReset = new Date(this.lastApiCallReset);

  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    this.currentMonthApiCalls = 0;
    this.lastApiCallReset = now;
    return this.save();
  }
};

module.exports = mongoose.model('User', userSchema);
