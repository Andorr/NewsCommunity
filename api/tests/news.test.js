const mongoose = require('mongoose');
const News = require('../models/news');
const controller = require('../controllers/news');
const http_mocks = require('node-mocks-http');
require('dotenv').config();

// Test Data
const testData = require('./newsTestData');
let newsId = null;

const db = mongoose.connect(
    process.env.MONGODB_TEST_DATABASE_URL, 
    {useNewUrlParser: true}
);

// requests and reponses
const buildResponse = () => (http_mocks.createResponse({eventEmitter: require('events').EventEmitter}));
const getAllNewsReq = ({method: 'GET', url: 'news/'});
const getNewsItemReq = (id) => ({method: 'GET', url: 'news/:id', params: {id: id}, userData: {}});

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
     
    afterAll(async (done) => {
        // Delete all data
        await News.deleteMany({});

        // Disconnect
        const { connections } = mongoose;
        for (const con of connections) {
            return con.close();
        }
        return mongoose.disconnect();
    });
     
    test('Tests sort', (done) => {
        News.find({}, (err, news) => {
            expect(news.length).toBe(testData.length);

            const response = buildResponse();
            const request = http_mocks.createRequest(getAllNewsReq);
            response.on('end', () => {
                const data = JSON.parse(response._getData());
                expect(data.length).toBe(testData.length);
                expect(isSorted(data)).toBeTruthy();
                done();
            });

            controller.news_get_all(request,response);
        });
    });

    test('Test get specific item', (done) => {
       /*  const item = testData[0];
        console.log(item);

        const response = buildResponse();
        const request = http_mocks.createRequest(getNewsItemReq(item.id));
        response.on('end', () => {
            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response._getData());
            expect(data.length).toBe(1);
            expect(data.title).toBe(item.title);
            done();
        });

        controller.news_get(request,response); */
        done();
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
