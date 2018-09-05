const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Project imports
const News = require('../models/news');
const constants = require('../helpers/constants');
const filehandler = require('../helpers/filehandler');
const upload = filehandler.upload;
const checkAuth = require('../middleware/check-auth');

// Fetch all news
router.get('/', (req, res) => {
    News.find({}, (err, data) => {
        if(err) {
            res.status(500);
        } else {
            res.json(data);
        }
    });
});

// Create a new news-item
router.post('/', upload.single('image'), (req, res) => {
    // Check if file was provided
    if(!req.file) {
        res.status(404).json({error: 'Image was not provided'});
        return;
    }

    // Create new news
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

// Delete news, all users can delete news
router.delete('/:id', checkAuth, (req, res) => {
    // Delete item
    News.delete({_id: req.params.id}).exec()
    .then((result) => {
        if(result) {
            res.status(200).json({message: 'deleted'});
        } else {
            res.status(500);
        }
    })
    .catch((error) => {
        res.status(500).json({message: error.message});
    });
});

module.exports = router;