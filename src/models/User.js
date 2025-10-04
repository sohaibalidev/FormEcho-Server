const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: "Please enter a valid email",
      },
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
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

// Reset current month API calls at the start of each month
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

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
