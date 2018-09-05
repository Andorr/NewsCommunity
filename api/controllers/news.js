const mongoose = require("mongoose");

const News = require('../models/news');

// Fetch all news
exports.news_get_all = (req, res) => {
    News.find({}, (err, data) => {
        if(err) {
            res.status(500);
        } else {
            res.json(data);
        }
    });
};

// Create a new news-item
exports.news_create = (req, res) => {
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
        res.status(201);
        res.json(news);
    })
    .catch((error) => {
        res.status(500);
        res.json({message: error.message});
    });
};

// Delete news, all users can delete news
exports.news_delete = (req, res) => {
    // Delete item
    News.deleteOne({_id: req.params.id}).exec()
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
};

// Edit news, only passed in items should affect the news
exports.news_put = (req, res) => {
    
    // Find News item
    News.findOne({_id: req.params.id}, (err, news) => {
        if(err) {
            res.status(404).json({error: err.message});
        } else {
            // Find changes
            if(req.body.title !== undefined) {
                news.title = req.body.title;
            }
            if(req.body.content  !== undefined) {
                news.content = req.body.content;
            }
            if(req.file) {
                news.image = req.headers.host + "/images/" + req.file.filename;
            }
            if(req.body.category !== undefined) {
                news.category = req.body.category;
            }
            if(req.body.importance !== undefined) {
                news.importance = req.body.importance;
            }
            news.save((error, updatedNews) => {
                if(error) {
                    res.status(400).send(error);
                } else {
                    res.status(200).send(updatedNews);
                }
            });
        }
    });
};