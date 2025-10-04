const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/api-keys', require('./apiKey.routes'));
router.use('/submissions', require('./submissions.routes'));
router.use('/submit', require('./submit.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
