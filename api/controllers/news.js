const mongoose = require("mongoose");

const News = require('../models/news');
const Vote = require('../models/vote');
const Comment = require('../models/comment');

// Fetch all news
exports.news_get_all = (req, res) => {
    // Get all news, and unselect votes list
    News.find({}).select('-votes').exec()
    .then((news) => {
        if(news) {
            res.json(news);
        } else {
            res.status(500);
        }
    })
    .catch((error) => {
        res.status(500).json({message: error.message});
    });
};

// Fetch a news-item based on id
exports.news_get = (req, res) => {
    News.findOne({_id: req.params.id}).select('-votes').exec()
    .then((news) => {
        if(news) {
            res.json(news);
        } else {
            res.status(500);
        }
    })
    .catch((error) => {
        res.status(500).json({message: error.message});
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

// Add comment to post
exports.news_comment_create = (req, res) => {
   
    // Find news item
    News.findById(req.body.news, (err, news) => {
        if(err) {
            res.status(500).json({message: err.message});
        } else if(!news) {
            res.status(404).json({message: 'Can not find the given news item'});
        } else {
            // Create new comment
            const comment = new Comment({
                comment: req.body.comment,
                user: req.userData.userId,
                user_nickname: req.userData.nickname,
            });
            comment.save().then((result) => {
                if(result) {
                    // Append new comment
                    news.update({$push: {comments: comment}}, (error, success) => {
                        if(err) {
                            res.status(500).json({message: error.message});
                        } else {
                            res.status(200).json(comment);
                        }
                    });
                } else {
                    res.status(500);
                }
            })
            .catch((error) => {
                res.status(500).json({message: error.message});
            });
        }
    });
};

// Vote on a news item
exports.news_vote = (req, res) => {
    // Find news item
    News.findById(req.body.news, (err, news) => {
        if(err) {
            res.status(500).json({message: err.message});
        } else if(!news) {
            res.status(404).json({message: 'Can not find the given news item'});
        } else {
            // TODO: Check if user has voted already

            // Create new vote
            const vote = new Vote({
                vote: req.body.vote,
                user: req.userData.userId,
            });
            vote.save().then((result) => {
                if(result) {
                    // Append new vote
                    news.update({$push: {votes: vote}, $inc: {vote_count: 1}}, (error, success) => {
                        if(err) {
                            res.status(500).json({message: error.message});
                        } else {
                            res.status(200).json(vote);
                        }
                    });
                } else {
                    res.status(500);
                }
            })
            .catch((error) => {
                res.status(500).json({message: error.message});
            });
        }
    });
};

// TODO: Delete vote