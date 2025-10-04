const FormSubmission = require("../models/FormSubmission");
const { sendFormSubmission } = require("../utils/email");
const APIKey = require("../models/APIKey");
const User = require("../models/User");

// @desc    Submit form data
// @route   POST /api/submit
// @access  Public (with API key)
const submitForm = async (req, res) => {
  try {
    const { formName, fields, sentTo } = req.body;
    const apiKey = req.apiKey;
    const user = req.user;

    // Validate required fields
    if (!formName || !fields || !sentTo) {
      return res.status(400).json({
        success: false,
        message: "formName, fields, and sentTo are required",
      });
    }

    // Check email limit
    if (user.currentMonthApiCalls >= apiKey.emailsPerMonth) {
      return res.status(429).json({
        success: false,
        message: "Monthly email limit exceeded",
      });
    }

    let submissionStatus = "delivered";
    let errorMessage = null;

    try {
      // Send email
      await sendFormSubmission(sentTo, fields, formName);

      // Update API key usage
      await apiKey.updateUsage();

      // Update user usage
      user.totalApiCalls += 1;
      user.currentMonthApiCalls += 1;
      await user.save();
    } catch (emailError) {
      submissionStatus = "failed";
      errorMessage = emailError.message;
    }

    // Log submission
    const submission = await FormSubmission.create({
      apiKeyId: apiKey._id,
      userId: user._id,
      formName,
      fields,
      sentTo,
      status: submissionStatus,
      errorMessage,
    });

    if (submissionStatus === "failed") {
      return res.status(500).json({
        success: false,
        message: "Form submitted but email failed to send",
        submissionId: submission._id,
      });
    }

    res.json({
      success: true,
      message: "Form submitted successfully",
      submissionId: submission._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting form",
    });
  }
};

// @desc    Get user's form submissions
// @route   GET /api/submissions
// @access  Private
const getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, formName } = req.query;

    const filter = { userId: req.user.id };
    if (formName) {
      filter.formName = new RegExp(formName, "i");
    }

    const submissions = await FormSubmission.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("apiKeyId", "name key");

    const total = await FormSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
    });
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmission = async (req, res) => {
  try {
    const submission = await FormSubmission.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("apiKeyId", "name key");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submission",
    });
  }
};

module.exports = {
  submitForm,
  getSubmissions,
  getSubmission,
};
