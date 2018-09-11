const express = require('express');
const router = express.Router();

// Middleware and helpers
const filehandler = require('../helpers/filehandler');
const upload = filehandler.upload;
const checkAuth = require('../middleware/check-auth');

const NewsController = require('../controllers/news');

router.get('/', NewsController.news_get_all);
router.get('/:id', NewsController.news_get);

router.post('/', checkAuth, upload.single('image'), NewsController.news_create);
router.post('/comment', checkAuth, NewsController.news_comment_create);
router.put('/comment/:id', checkAuth, NewsController.news_comment_edit);
router.delete('/comment/:id', checkAuth, NewsController.news_comment_delete);

router.post('/vote', checkAuth, NewsController.news_vote);

router.delete('/:id', checkAuth, NewsController.news_delete);
router.put('/:id', checkAuth, upload.single('image'), NewsController.news_put);

module.exports = router;