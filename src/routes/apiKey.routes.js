const express = require('express');
const router = express.Router(); // <--- this was missing
const { protect } = require('../middleware/auth.middleware');
const apikeyController = require('../controllers/apiKey.controller');

router.use(protect);

router.get('/stats', apikeyController.getStats);

router
  .route('/keys')
  .get(apikeyController.getAPIKeys)
  .post(apikeyController.createAPIKey);

router.put('/keys/:id', apikeyController.updateAPIKey);

router.put('/tier', apikeyController.updateUserTier);

module.exports = router;
