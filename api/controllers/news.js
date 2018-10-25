const mongoose = require("mongoose");

const News = require('../models/news');
const wss = require('../helpers/ws');
// ----- NEWS -------

// Fetch all news
exports.news_get_all = (req, res) => {
    // Get all news, and unselect votes list
    News.find({}).sort('-created_at').exec()
    .then((news) => {
        if(news) {
            const userId = (req.userData)? req.userData.userId : '';
            const newsItems = news.map((value) => {
                const item = {...value._doc, isVoted: value.votes.findIndex((elem) => elem.user == userId) !== -1};
                delete item.votes;
                return item;
            });
           
            res.json(newsItems);
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
    News.findOne({_id: req.params.id}).exec()
    .then((news) => {
        if(news) {
            const userId = req.userData ? req.userData.userId : null;
            const item = {...news._doc, isVoted: news.votes.findIndex((elem) => elem.user == userId) !== -1};
            delete item.votes;
            res.json(item);
        } else {
            res.status(500);
        }
    })
    .catch((error) => {
        console.log(error);
        res.status(500).json({message: error.message});
    });
};

// Create a new news-item
exports.news_create = (req, res) => {
    // Check if file was provided
    if(!req.file && !req.body.image_link) {
        res.status(400).json({error: 'Image was not provided'});
        return;
    }

    // Link to uploaded/given image
    const imageLink = (req.file)? 'http://' + req.headers.host + "/images/" + req.file.filename : req.body.image_link;

    // Create new news
    const news = new News({
        id: new mongoose.Types.ObjectId(),
        image: imageLink,
        ...req.body,
    });
    news.save().then((result) => {
        wss.send(result); // Send news-item through the webserver
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
            else if(req.body.image_link) {
                news.image = req.body.image_link;
            }
            if(req.body.category !== undefined) {
                news.category = req.body.category;
            }
            if(req.body.importance !== undefined) {
                news.importance = req.body.importance;
            }
            if(req.body.subtitle !== undefined) {
                news.subtitle = req.body.subtitle;
            }
            news.save((error, updatedNews) => {
                if(error) {
                    res.status(400).send(error);
                } else {
                    wss.send(updatedNews); // Send news-item through the webserver
                    res.status(200).send(updatedNews);
                }
            });
        }
    });
};

// ------- COMMENTS ------

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
            const comment = {
                comment: req.body.comment,
                user: req.userData.userId,
                user_nickname: req.userData.nickname,
            }
            news.comments.push(comment);
            news.save((error, success) => {
                if(err) {
                    res.status(500).json({message: error.message});
                } else {
                    wss.send(news); // Send news-item through the webserver
                    res.status(201).json(news);
                }
            });
        }
    });
};

// Edit comment
exports.news_comment_edit = (req, res) => {

    News.findById(req.body.news, (err, news) => {
        if(err) {
            res.status(500).json({error: err.message});
        } else {
            const commentId = req.params.id;
            const index = news.comments.findIndex((elem) => elem.id == commentId);
            if(index != -1) {
                news.comments[index].comment = req.body.comment;
            }
            news.save((error, success) => {
                if(error) {
                    res.status(500).json({message: error.message});
                } else {
                    wss.send(news);
                    res.status(200).json(news.comments[index]);
                }
            });
        }
    });
}

// Delete comment
exports.news_comment_delete = (req, res) => {

    News.findById(req.body.news, (err, news) => {
        if(err) {
            res.status(500).json({error: err.message});
        } else {
            const commentId = req.params.id;
            const index = news.comments.findIndex((elem) => elem.id == commentId);
            if(index != -1) {
                news.comments.splice(index,1);
            }
            news.save((error, success) => {
                if(error) {
                    res.status(500).json({message: error.message});
                } else {
                    wss.send(news);
                    res.status(200).json({message: 'deleted'});
                }
            });
        }
    });
}


// ------- VOTES ----------

// Vote on a news item - create 
exports.news_vote = (req, res) => {
    // Find news item
    News.findById(req.body.news, (err, news) => {
        if(err) {
            res.status(500).json({message: err.message});
        } else if(!news) {
            res.status(404).json({message: 'Can not find the given news item'});
        } else {
            // Check if it already exists
            const index = news.votes.findIndex((elem) => elem.user == req.userData.userId);

            // If vote is an upvote
            if(req.body.upvote === true) {
                if(index === -1) {
                    const vote = {
                        user: req.userData.userId,
                    };
                    news.votes.push(vote);
                    news.vote_count += 1;
                    news.save((error, success) => {
                        if(error) {
                            res.status(500).json({message: error.message});
                        } else {
                            wss.send(news); // Send news-item through the webserver
                            res.status(201).json(vote);
                        }
                    });
                } else {
                    res.status(404).send("");
                }
            } else {
                // Delete item
                if(index !== -1) {
                    news.votes.splice(index,1);
                    news.vote_count -= 1;
                    news.save((error, success) => {
                        if(error) {
                            res.status(500).json({message: error.message});
                        } else {
                            wss.send(news); // Send news-item through the webserver
                            res.status(200).json({message: 'deleted'});
                        }
                    });
                } else {
                    res.status(404).send("");
                }
            }
        }
    });
};
