const mongoose = require('mongoose');
const News = require('../models/user');
const controller = require('../controllers/news');
const http_mocks = require('node-mocks-http');
require('dotenv').config();

// Test Data
const testData = require('./newsTestData');

const db = mongoose.connect(
    process.env.MONGODB_TEST_DATABASE_URL, 
    {useNewUrlParser: true}
);

// requests and reponses
const buildResponse = () => (http_mocks.createResponse({eventEmitter: require('events').EventEmitter}));
const getNewsRequest = (http_mocks.createRequest())

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

describe('Testing user controller', () => {
    beforeAll((done) => {
        // Drop data
        News.deleteMany({}, (err) => {
            testData.forEach((n) => {
                new News({
                    id: new mongoose.Types.ObjectId(),
                    image: n.image,
                    ...n,
                });
            });
            done();
        });
    });
     
    afterAll((done) => {
        // Disconnect
        const { connections } = mongoose;
        for (const con of connections) {
            return con.close();
        }
        return mongoose.disconnect();
    });
     
    test('Tests sort', (done) => {
        News.find({}, (err, news) => {
            expect(isSorted(news)).toBeTruthy();
            done();
        });
    });
});

// --- HELPER METHODS ---
const isSorted = (arr) => {
    for(let i = 0; i < arr.length-1; i++) {
        if(arr[i].created_at > arr[i + 1].created_at) {
            return false;
        }
    }
    return true;
}
