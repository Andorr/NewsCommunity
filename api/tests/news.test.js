const mongoose = require('mongoose');
const News = require('../models/news');
const User = require('../models/user');
const controller = require('../controllers/news');
const http_mocks = require('node-mocks-http');
const {EventEmitter} = require('events');
require('dotenv').config();

// Test Data
const sampleData = require('./newsTestData');
const testData = sampleData.data;
const user = sampleData.user;
let newsId = null;

const db = mongoose.connect(
    process.env.MONGODB_TEST_DATABASE_URL, 
    {useNewUrlParser: true}
);

// requests and reponses
const buildResponse = () => (http_mocks.createResponse({eventEmitter: EventEmitter}));
const getAllNewsReq = ({method: 'GET', url: 'news/'});
const getNewsItemReq = (id) => ({method: 'GET', url: 'news/:id', params: {id: id}});
const createNewsRequest = (data) => ({method: 'POST', url: 'news/', body: {...data}, file: {fileName: data.image}});
const deleteNewsItemReq = (id) => ({method: 'DELETE', url: 'news/:id', params: {id: id}});
const updateNewsItemReq = (id, body) => ({method: 'PUT', url: 'news/:id', params: {id: id}, body: body});
const createCommentRequest = (id, comment) => ({method: 'POST', url: 'news/comment/', body: {news: id, comment: comment}, userData: {userId: '1234', nickname: 'asdf'}});
const updateCommentRequest = (newsId, commentId, comment) => ({method: 'POST', url: 'news/comment/:id', params: {id: commentId}, body: {news: newsId, comment: comment}, userData: {userId: '1234', nickname: 'asdf'}});
const deleteCommentRequest = (newsId, commentId) => ({method: 'DELETE', url: 'news/comment/:id', params: {id: commentId}, body: {news: newsId}, userData: {userId: '1234', nickname: 'asdf'}});
const voteNewsItemReq = (newsId, upvote, userId) => ({method: 'POST', url: 'news/vote/', body: {news: newsId, upvote: upvote}, userData: {userId: userId, nickname: 'asdf'}});

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

describe('Testing user controller', () => {
    beforeAll((done) => {
        // Drop data
       
        News.deleteMany({}, async (err) => {
            let count = 0;

            // Delete users
            await User.deleteOne({email: user.email});

            // Create user
            const newUser = new User({
                email: user.email,
                password: user.password,
                nickname: user.nickname,
            });

            let resultUser = null;
            await newUser.save().then((result) => {
                user.id = result._id;
                resultUser = result;
            });

            testData.forEach(async (n) => {
                const news = new News({
                    id: new mongoose.Types.ObjectId(),
                    image: n.image,
                    author: {
                        email: user.email,
                        nickname: user.nickname,
                    },
                    ...n,
                });
                
                // Create new data
                await news.save().then((newsItem) => {
                    testData[count].id = newsItem._id;
                    count++;
                    newsId = newsItem._id;
                    if(count === testData.length) {
                        done();
                    }
                }).catch((err) => {
                    console.log("ERR: " , err);
                });
            });
            
        });
    });
     
    afterAll((done) => {
        // Delete all data
        User.deleteOne({email: user.email})
        .then(() => {
            News.deleteMany({})
            .then((err) => {
                // Disconnect
                const { connections } = mongoose;
                for (const con of connections) {
                    return con.close();
                }
                return mongoose.disconnect();
            });
        });
    });
     
    // GET ALL - SORT
    test('Tests sort', (done) => {
        News.find({}, (err, news) => {
            // Check data
            expect(news.length).toBe(testData.length);

            // Create request
            const response = buildResponse();
            const request = http_mocks.createRequest(getAllNewsReq);
            response.on('end', () => {
                // Check data length and if sorted
                const data = JSON.parse(response._getData());
                expect(data.length).toBe(testData.length);
                expect(isSorted(data)).toBeTruthy();
                done();
            });

            controller.news_get_all(request,response);
        });
    });

    // GET ITEM
    test('Test get specific item', (done) => {
        News.findOne({}, (err, news) => {
            // Create request
            const response = buildResponse();
            const request = http_mocks.createRequest(getNewsItemReq(news.id));
            response.on('end', () => {
                // Check if response data is identical to the given news-data
                const data = JSON.parse(response._getData());
                const status = response.statusCode;
                expect(status).toBe(200);
                expect(data.title).toBe(news.title);
                expect(data.content).toBe(news.content);
                expect(data.category).toBe(news.category);
                expect(data.importance).toBe(news.importance);
                done();
            });

            controller.news_get(request,response);
        });
    });

    // CREATE
    test('Create news item', (done) => {
        const item = sampleData.extra;
        
        // Create request
        const response = buildResponse();
        const request = http_mocks.createRequest(createNewsRequest(item));
        response.on('end', () => {
            const status = response.statusCode;
            const data = JSON.parse(response._getData());
            expect(status).toBe(201);
            expect(data.title).toBe(item.title);
            expect(data.content).toBe(item.content);
            expect(data.author).toBeDefined();
            expect(data.author.email).toBe(item.author.email);
            expect(data.author.nickname).toBe(item.author.nickname);

            News.find({}, (err, news) => {
                expect(news.length).toBe(3);
                done();
            });
            
        });
        
        controller.news_create(request, response);
    });

    // DELETE
    test('Delete news item', (done) => {
        const item = sampleData.extra;
        const news = new News({
            id: new mongoose.Types.ObjectId(),
            author: {
                email: user.email,
                nickname: user.nickname,
            },
            ...item,
        }).save().then((newsItem) => {

            // Create request
            const response = buildResponse();
            const request = http_mocks.createRequest(deleteNewsItemReq(newsItem._id));
            response.on('end', () => {
                const status = response.statusCode;
                const data = JSON.parse(response._getData());
                expect(status).toBe(200);
                
                News.find({_id: newsItem._id}, (err, news) => {
                    expect(news.length).toBe(0);
                    done();
                });
                
            });
            
            controller.news_delete(request, response);
        });
    });

    // UPDATE
    test('Update news item', (done) => {
        const item = testData[0];
        const body = {
            title: 'This is a new title',
            content: 'This is new content',
            category: 'sport',
        };
        
        // Create request
        const response = buildResponse();
        const request = http_mocks.createRequest(updateNewsItemReq(item.id, body));
        response.on('end', () => {
            // Check response status
            const status = response.statusCode;
            expect(status).toBe(200);
            
            // Find the same item and compare values
            News.findById(item.id, (err, news) => {
                // Changed values
                expect(news).toBeDefined();
                expect(news.title).toBe(body.title);
                expect(news.content).toBe(body.content);
                expect(news.category).toBe(body.category);

                // Unchanged values
                expect(news.importance).toBe(item.importance);
                expect(news.image).toBe(item.image);
                
                done();
            });
            
        });
        
        controller.news_put(request, response);
    });

    // CREATE COMMENT
    test('Create comment', (done) => {
        const item = testData[0];
        const comment = 'My awesome comment!';
        
        // Create request
        const response = buildResponse();
        const request = http_mocks.createRequest(createCommentRequest(item.id, comment));
        response.on('end', () => {
            const status = response.statusCode;
            const data = JSON.parse(response._getData());
            
            // Check status code and if comment was added
            expect(status).toBe(201);
            expect(data.comments.findIndex((e) => e.comment === comment) >= 0).toBeTruthy();
            done();
        });

        controller.news_comment_create(request, response);
    });

    // UPDATE COMMENT
    test('Test edit comment', (done) => {
        const item = testData[1];
        const comment = {
            comment: 'MY NEW COMMENT',
            user: user.id,
            user_nickname: user.nickname,
        };
        const newComment = 'I need help!';

        // Create comment
        News.findById(item.id, (err, newsItem) => {
            expect(err).toBeNull();

            newsItem.comments.push(comment);
            newsItem.save().then((news) => {
                expect(news).toBeDefined();

                // Update comment
                const response = buildResponse();
                const request = http_mocks.createRequest(updateCommentRequest(item.id, news.comments[0].id, newComment));
                response.on('end', () => {
                    const status = response.statusCode;
                    const data = JSON.parse(response._getData());
                    
                    // Check status code
                    expect(status).toBe(200);
                    
                    // Check if comment was changed
                    News.findById(item.id, (err, updatedNews) => {
                        expect(updatedNews.comments.length).toBe(1);
                        expect(updatedNews.comments[0].comment).toBe(newComment);
                        done();
                    });
                });
                
                controller.news_comment_edit(request, response);
            });
        });
    });

    // DELETE COMMENT
    test('Test delete comment', (done) => {
        const item = testData[1];
        const comment = {
            comment: 'MY NEW COMMENT',
            user: user.id,
            user_nickname: user.nickname,
        };

        // Create comment to delete
        News.findById(item.id, (err, newsItem) => {
            expect(err).toBeNull();

            newsItem.comments.push(comment);
            newsItem.save().then((news) => {
                expect(news).toBeDefined();

                // Delete comment
                const commentID = news.comments[0]._id;
                const response = buildResponse();
                const request = http_mocks.createRequest(deleteCommentRequest(item.id, commentID));
                response.on('end', () => {
                    const status = response.statusCode;
                    const data = JSON.parse(response._getData());

                    // Check status code
                    expect(status).toBe(200);
                    
                    // Check if comment was changed
                    News.findById(item.id, (err, updatedNews) => {
                        expect(updatedNews.comments.findIndex(e => e._id === commentID)).toBe(-1);
                        done();
                    });
                });
                
                controller.news_comment_delete(request, response);
            });
        });
    });

    // Vote
    test('Test upvote news', (done) => {
        const item = testData[0];

        // Create requests
        const response = buildResponse();
        const request = http_mocks.createRequest(voteNewsItemReq(item.id, true, user.id));

        response.on('end', () => {
            const status = response.statusCode;
            expect(status).toBe(201);

            // Check if vote was added
            News.findById(item.id, (err, news) => {
                expect(news).toBeDefined();
                expect(news._id).toEqual(item.id);
                expect(news.vote_count).toBe(1);
                expect(news.votes.length).toBe(1);
                expect(news.votes[0].user).toEqual(user.id);
                done();
            });
        });

        controller.news_vote(request, response);
    });
});

// --- HELPER METHODS ---
const isSorted = (arr) => {
    for(let i = 0; i < arr.length-1; i++) {
        if(arr[i].created_at < arr[i + 1].created_at) {
            return false;
        }
    }
    return true;
}
