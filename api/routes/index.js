const express = require('express');
const router = express.Router();

// Main routes
router.use('/news', require('./news'));
router.use('/account', require('./user'));

module.exports = router;