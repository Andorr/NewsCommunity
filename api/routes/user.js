// @flow 
const express = require('express');
import {Router} from 'express';
const router: Router = express.Router();

const UserController = require('../controllers/user');

// Middleware and helpers
const filehandler = require('../helpers/filehandler');
const upload = filehandler.upload;
const auth = require('../middleware/auth');

router.get('/', auth.checkAuth, UserController.user_get);
router.post('/signup', UserController.user_create);
router.post('/login', UserController.user_login);
router.delete('/:userId', auth.checkAuth, UserController.user_delete);
router.post('/avatar', auth.checkAuth, upload.single('image'), UserController.user_set_image);

module.exports = router;