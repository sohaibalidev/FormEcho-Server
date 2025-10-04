const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "APIKey",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formName: {
      type: String,
      required: true,
    },
    fields: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    sentTo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["delivered", "failed"],
      default: "delivered",
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);
