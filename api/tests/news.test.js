// @flow 
const mongoose = require('mongoose');
const News = require('../models/news');
const User = require('../models/user');
const controller = require('../controllers/news');
const http_mocks = require('node-mocks-http');
import type {MockResponse, MockRequest} from 'node-mocks-http';
const {EventEmitter} = require('events');
require('dotenv').config();

// Test Data
const sampleData: Object = require('./newsTestData');
const testData: Object = sampleData.data;
const user: Object= sampleData.user;
let newsId: ?string = null;

const db = mongoose.connect(
    process.env.MONGODB_TEST_DATABASE_URL || '', 
    {useNewUrlParser: true}
);

// requests and reponses
const buildResponse: Function = () => (http_mocks.createResponse({eventEmitter: EventEmitter}));
const getAllNewsReq: Object = ({method: 'GET', url: 'news/'});
const getAllNewsWithParams: Function = (params: Object) => ({method: 'GET', url: 'news/', query: params});
const getNewsItemReq: Function = (id: string, userId: string) => ({method: 'GET', url: 'news/:id', params: {id: id}, userData: {userId: userId}});
const createNewsRequest: Function = (data: Object) => ({method: 'POST', url: 'news/', body: {...data}, file: {fileName: data.image}});
const deleteNewsItemReq: Function = (id: string, userId: string) => ({method: 'DELETE', url: 'news/:id', params: {id: id}, userData: {userId: userId}});
const updateNewsItemReq: Function = (id: string, body: Object, userId: string) => ({method: 'PUT', url: 'news/:id', params: {id: id}, body: body, userData: {userId: userId}});
const createCommentRequest: Function = (id: string, comment: string) => ({method: 'POST', url: 'news/comment/', body: {news: id, comment: comment}, userData: {userId: '1234', nickname: 'asdf'}});
const updateCommentRequest: Function = (newsId: string, commentId: string, comment: string, userId: string) => ({method: 'PUT', url: 'news/comment/:id', params: {id: commentId}, body: {news: newsId, comment: comment}, userData: {userId: userId, nickname: 'asdf'}});
const deleteCommentRequest: Function = (newsId, commentId, userId) => ({method: 'DELETE', url: 'news/comment/:id', params: {id: commentId}, body: {news: newsId}, userData: {userId: userId, nickname: 'asdf'}});
const voteNewsItemReq: Function = (newsId: string, upvote: string, userId: string) => ({method: 'POST', url: 'news/vote/', body: {news: newsId, upvote: upvote}, userData: {userId: userId, nickname: 'asdf'}});

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

describe('Testing user controller', () => {
    beforeAll((done) => {
        // Drop data
       
        News.deleteMany({}, async (err: Error) => {
            let count: number = 0;

            // Delete users
            await User.deleteOne({email: user.email});

            // Create user
            const newUser: User = new User({
                email: user.email,
                password: user.password,
                nickname: user.nickname,
            });

            let resultUser: User = null;
            await newUser.save().then((result: User) => {
                user.id = result._id;
                sampleData.extra.author.id = user.id;   
                resultUser = result;
            });

            // Create news data for every item in testData
            testData.forEach(async (n: Object) => {
                const news = new News({
                    id: new mongoose.Types.ObjectId(),
                    image: n.image,
                    author: {
                        user: user.id,
                        email: user.email,
                        nickname: user.nickname,
                    },
                    ...n,
                });
                
                // Create new data
                await news.save().then((newsItem: News) => {
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
            .then((err: Error) => {
                // Disconnect
                const { connections } = mongoose;
                for (const con of connections) {
                    return con.close();
                }
                mongoose.disconnect();
                done();
            });
        });
    });
     
    // GET ALL - SORT
    test('Tests sort', (done) => {
        News.find({}, (err: Error, news: News[]) => {
            // Check data
            expect(news.length).toBe(testData.length);

            // Create request
            const response: MockResponse = buildResponse();
            const request: MockRequest = http_mocks.createRequest(getAllNewsReq);
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
            const response: MockResponse = buildResponse();
            const request: MockRequest = http_mocks.createRequest(getNewsItemReq(news.id));
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
        const item: Object = sampleData.extra;
        item.author.user = user.id;
        
        // Create request
        const response: MockResponse = buildResponse();
        const request: MockRequest = http_mocks.createRequest(createNewsRequest(item));
        response.on('end', () => {
            const status = response.statusCode;
            const data = JSON.parse(response._getData());
            expect(status).toBe(201);
            expect(data.title).toBe(item.title);
            expect(data.content).toBe(item.content);
            expect(data.author).toBeDefined();
            expect(data.author.email).toBe(item.author.email);
            expect(data.author.nickname).toBe(item.author.nickname);

            News.find({}, (err: Error, news: News[]) => {
                expect(news.length).toBe(3);
                done();
            });
            
        });
        
        controller.news_create(request, response);
    });

    // DELETE
    test('Delete news item', (done) => {
        const item: Object = sampleData.extra;
        const news: News = new News({
            id: new mongoose.Types.ObjectId(),
            ...item,
            author: {
                user: user.id,
                email: user.email,
                nickname: user.nickname,
            },
        }).save().then((newsItem: News) => {
            // Create request
            const response: MockResponse = buildResponse();
            const request: MockRequest = http_mocks.createRequest(deleteNewsItemReq(newsItem._id, user.id));
            response.on('end', () => {
                const status: number = response.statusCode;
                const data: Object = JSON.parse(response._getData());
                expect(status).toBe(200);
                
                News.find({_id: newsItem._id}, (err: Error, news: News[]) => {
                    expect(news.length).toBe(0);
                    done();
                });
                
            });
            
            controller.news_delete(request, response);
        });
    });

    // UPDATE
    test('Update news item', (done: Function) => {
        const item: Object = testData[0];
        const body: Object = {
            title: 'This is a new title',
            content: 'This is new content',
            category: 'sport',
        };
        
        // Create request
        const response: MockResponse = buildResponse();
        const request: MockRequest = http_mocks.createRequest(updateNewsItemReq(item.id, body, user.id));
        response.on('end', () => {
            // Check response status
            const status: number = response.statusCode;
            expect(status).toBe(200);
            
            // Find the same item and compare values
            News.findById(item.id, (err: Error, news: News) => {
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
    test('Create comment', (done: Function) => {
        const item: Object = testData[0];
        const comment: string = 'My awesome comment!';
        
        // Create request
        const response: MockResponse = buildResponse();
        const request: MockRequest = http_mocks.createRequest(createCommentRequest(item.id, comment));
        response.on('end', () => {
            const status: number = response.statusCode;
            const data: Object = JSON.parse(response._getData());
            
            // Check status code and if comment was added
            expect(status).toBe(201);
            expect(data.comment === comment).toBeTruthy();
            done();
        });

        controller.news_comment_create(request, response);
    });

    // UPDATE COMMENT
    test('Test edit comment', (done: Function) => {
        const item: Object = testData[1];
        const comment: Object = {
            comment: 'MY NEW COMMENT',
            user: user.id,
            user_nickname: user.nickname,
        };
        const newComment: string = 'I need help!';

        // Find news item and create comment
        News.findById(item.id, (err: Error, newsItem: Object) => {
            expect(err).toBeNull();

            // Create comment
            newsItem.comments.push(comment);
            newsItem.save().then((news) => {
                expect(news).toBeDefined();

                // Update comment
                const response: MockResponse = buildResponse();
                const request: MockRequest = http_mocks.createRequest(updateCommentRequest(item.id, news.comments[0].id, newComment, user.id));
                response.on('end', () => {
                    const status: number = response.statusCode;
                    const data: Object = JSON.parse(response._getData());
                    
                    // Check status code
                    expect(status).toBe(200);
                    
                    // Check if comment was changed
                    News.findById(item.id, (err: Error, updatedNews: News) => {
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
    test('Test delete comment', (done: Function) => {
        const item: Object = testData[1];
        const comment: Object = {
            comment: 'MY NEW COMMENT',
            user: user.id,
            user_nickname: user.nickname,
        };

        // Create comment to delete
        News.findById(item.id, (err: Error, newsItem: News) => {
            expect(err).toBeNull();

            newsItem.comments.push(comment);
            newsItem.save().then((news) => {
                expect(news).toBeDefined();

                // Delete comment
                const commentID: string = news.comments[0]._id;
                const response: MockResponse = buildResponse();
                const request: MockRequest = http_mocks.createRequest(deleteCommentRequest(item.id, commentID, user.id));
                response.on('end', () => {
                    const status: number = response.statusCode;
                    const data: Object = JSON.parse(response._getData());

                    // Check status code
                    expect(status).toBe(200);
                    
                    // Check if comment was changed
                    News.findById(item.id, (err: Error, updatedNews: News) => {
                        expect(updatedNews.comments.findIndex(e => e._id === commentID)).toBe(-1);
                        done();
                    });
                });
                
                controller.news_comment_delete(request, response);
            });
        });
    });

    // Vote
    test('Test upvote news', (done: Function) => {
        const item = testData[0];

        // Create requests
        const response: MockResponse = buildResponse();
        const request: MockRequest = http_mocks.createRequest(voteNewsItemReq(item.id, true, user.id));

        response.on('end', () => {
            const status: number = response.statusCode;
            expect(status).toBe(201);

            // Check if vote was added
            News.findById(item.id, (err: Error, news: News) => {
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
const isSorted: Function = (arr: Array<News>): bool => {
    for(let i = 0; i < arr.length-1; i++) {
        if(arr[i].created_at < arr[i + 1].created_at) {
            return false;
        }
    }
    return true;
}
