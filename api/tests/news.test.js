const mongoose = require('mongoose');
const News = require('../models/news');
const controller = require('../controllers/news');
const http_mocks = require('node-mocks-http');
const {EventEmitter} = require('events');
require('dotenv').config();

// Test Data
const sampleData = require('./newsTestData');
const testData = sampleData.data;
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
// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

describe('Testing user controller', () => {
    beforeAll((done) => {
        // Drop data
        News.deleteMany({}, async (err) => {
            let count = 0;
            testData.forEach(async (n) => {
                const news = new News({
                    id: new mongoose.Types.ObjectId(),
                    image: n.image,
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
        News.deleteMany({})
        .then((err) => {
            const { connections } = mongoose;
            for (const con of connections) {
                return con.close();
            }
            return mongoose.disconnect();
        })

        // Disconnect
        
    });
     
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

            News.find({}, (err, news) => {
                expect(news.length).toBe(3);
                done();
            });
            
        });
        
        controller.news_create(request, response);
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
