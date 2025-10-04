const nodemailer = require("nodemailer");
const config = require("../config/app.config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

const sendMagicLink = async (email, token) => {
  const magicLink = `${config.CLIENT_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"FormEcho" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Your FormEcho Magic Link",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to FormEcho!</h2>
        <p>Click the link below to sign in to your account:</p>
        <a href="${magicLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Sign In to FormEcho
        </a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendPasswordReset = async (email, token) => {
  const resetLink = `${config.CLIENT_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"FormEcho" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your FormEcho Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendFormSubmission = async (to, formData, formName) => {
  const mailOptions = {
    from: `"FormEcho" <${config.EMAIL_USER}>`,
    to,
    subject: `New Form Submission: ${formName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New ${formName} Submission</h2>
        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px;">
          ${Object.entries(formData)
            .map(
              ([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `
            )
            .join("")}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">
          This submission was received via FormEcho.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendMagicLink,
  sendPasswordReset,
  sendFormSubmission,
  transporter,
};
