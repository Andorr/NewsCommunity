const mongoose = require('mongoose');
const User = require('../models/user');
const controller = require('../controllers/user');
const http_mocks = require('node-mocks-http');
require('dotenv').config();

const db = mongoose.connect(
    process.env.MONGODB_TEST_DATABASE_URL, 
    {useNewUrlParser: true}
);

const email = 'andershallemiversen@hotmail.com';
const password = '1234abcd';
const nickname = 'andorr';

// requests and reponses
const buildResponse = () => (http_mocks.createResponse({eventEmitter: require('events').EventEmitter}));
const createUserRequest = {method: 'POST', url: 'account/signup', body: {email: email, password: password, nickname: nickname}};
const loginRequest = {method: 'POST', url: 'account/login', body: {email: email, password: password}};
const deleteRequest = (userId) => ({method: 'DELETE', url: 'account/', params: {userId: userId}, userData: {userId: userId}});

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

describe('Testing user controller', () => {
    beforeAll((done) => {
        // Drop data
        User.deleteMany({}, (err) => {
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
     
    test('Create user', (done) => {
        // Create requests and response
        const response = buildResponse();
        const request = http_mocks.createRequest(createUserRequest);
        response.on('end', () => {
            expect(response.statusCode).toBe(201);
            // Check if user was created
            User.findOne({email: email}, (err, user) => {
                expect(user.email === email).toBeTruthy();
                expect(user.nickname === nickname).toBeTruthy();
                done();
            });
        });
        
        // Send request
        controller.user_create(request, response);
    });


    test('Test login', (done) => {
        // Create requests and response
        const response = buildResponse();
        const request = http_mocks.createRequest(loginRequest);
        response.on('end', () => {

            // Check if token was received
            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response._getData());
            expect(data.token).toBeDefined();
            expect(data.token.length > 20).toBeTruthy();
            done();
        });

        controller.user_login(request, response);
    });

    test('Delete user', (done) => {
        // Get user id
        User.findOne({}, (err, user) => {
            if(err) {
                console.log(err);
            }
            expect(err).toBeNull();
            const userId = user._id; // UserId

            // Mock request and response
            const response = buildResponse();
            const request = http_mocks.createRequest(deleteRequest(userId));
            response.on('end', () => {
                expect(response.statusCode).toBe(200);

                // Check if user was deleted
                User.findById(userId, (err, users) => {
                    expect(users).toBeNull();
                    done();
                });
            });

            controller.user_delete(request, response);
        });
    });
});
