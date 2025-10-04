const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/app.config');

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

exports.getMe = async (req, res) => {
  const { _id, name, email, picture, role, tier } = req.user;
  res.json({
    success: true,
    user: { id: _id, name, email, picture, role, tier },
  });
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'No ID token provided',
      });
    }

    const payload = await verifyGoogleToken(idToken);

    if (!payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google email not verified',
      });
    }

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      const role = payload.email === config.EMAIL_ADMIN ? 'admin' : 'user';

      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        tier: 'free',
        role,
      });
    } else {
      if (payload.email === config.EMAIL_ADMIN && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 * 24 * 30,
    });

    const { _id, name, email, picture, role } = user;
    res.json({ success: true, user: { id: _id, name, email, picture, role } });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      message: 'Invalid Google token',
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
