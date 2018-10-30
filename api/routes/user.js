const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user');
const auth = require('../middleware/auth');

router.get('/', UserController.user_get);
router.post('/signup', UserController.user_create);
router.post('/login', UserController.user_login);
router.delete('/:userId', auth.checkAuth, UserController.user_delete);

module.exports = router;