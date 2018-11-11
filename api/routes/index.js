// @flow
const express = require('express');
import {Router} from 'express';
const router: Router = express.Router();

// Main routes
router.use('/news', require('./news'));
router.use('/account', require('./user'));

module.exports = router;