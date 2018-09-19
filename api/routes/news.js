const express = require('express');
const router = express.Router();

// Middleware and helpers
const filehandler = require('../helpers/filehandler');
const upload = filehandler.upload;
const auth = require('../middleware/auth');

const NewsController = require('../controllers/news');

router.get('/', auth.withAuth, NewsController.news_get_all);
router.get('/:id', auth.withAuth, NewsController.news_get);

router.post('/', auth.checkAuth, upload.single('image'), NewsController.news_create);
router.post('/comment', auth.checkAuth, NewsController.news_comment_create);
router.put('/comment/:id', auth.checkAuth, NewsController.news_comment_edit);
router.delete('/comment/:id', auth.checkAuth, NewsController.news_comment_delete);

router.post('/vote', auth.checkAuth, NewsController.news_vote);

router.delete('/:id', auth.checkAuth, NewsController.news_delete);
router.put('/:id', auth.checkAuth, upload.single('image'), NewsController.news_put);

module.exports = router;