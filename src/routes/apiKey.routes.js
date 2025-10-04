const express = require('express');
const {
  getAPIKey,
  createAPIKey,
  updateAPIKey,
  getAPIKeyUsage,
} = require('../controllers/apiKey.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getAPIKey).post(createAPIKey).put(updateAPIKey);

router.get('/usage', getAPIKeyUsage);

module.exports = router;
