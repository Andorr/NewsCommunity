const express = require('express');
const router = express.Router();

// Middleware and helpers
const filehandler = require('../helpers/filehandler');
const upload = filehandler.upload;
const checkAuth = require('../middleware/check-auth');

const NewsController = require('../controllers/news');

router.get('/', NewsController.news_get_all);
router.post('/', upload.single('image'), NewsController.news_create);
router.delete('/:id', checkAuth, NewsController.news_delete);
router.put('/:id', upload.single('image'), NewsController.news_put);

module.exports = router;