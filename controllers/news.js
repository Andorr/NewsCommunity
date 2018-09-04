const express = require('express');
const router = express.Router();
const News = require('../models/newsModel');
const constants = require('../helpers/constants');

router.get('/', (req, res) => {
    News.find({}, (err, data) => {
        res.json(data);
    });
});

router.post('/', (req, res) => {
    console.log("Request received", req.body);
    const news = new News(req.body);
    news.save();
    res.status(constants.created);
    res.json(news);
});

module.exports = router;