const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Project imports
const News = require('../models/newsModel');
const constants = require('../helpers/constants');
const filehandler = require('../helpers/filehandler');
const upload = filehandler.upload;

router.get('/', (req, res) => {
    News.find({}, (err, data) => {
        res.json(data);
    });
});

router.post('/', upload.single('image'), (req, res) => {
    console.log(req);
    const news = new News({
        id: new mongoose.Types.ObjectId(),
        created_at: new Date(),
        image: req.headers.host + "/images/" + req.file.filename,
        ...req.body,
    });
    news.save().then((result) => {
        console.log(result);
        res.status(constants.created);
        res.json(news);
    })
    .catch((error) => {
        res.status(500);
        res.json({message: error.message});
    });
});

module.exports = router;