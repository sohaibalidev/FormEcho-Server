const express = require('express');
const { attachUser } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(attachUser)

router.use('/auth', require('./auth.routes'));
router.use('/api-keys', require('./apiKey.routes'));
router.use('/submissions', require('./submissions.routes'));
router.use('/submit', require('./submit.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
