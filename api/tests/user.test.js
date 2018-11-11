// @flow
const mongoose = require('mongoose');
const User = require('../models/user');
const controller = require('../controllers/user');
const http_mocks = require('node-mocks-http');
import type {MockResponse, MockRequest} from 'node-mocks-http';
require('dotenv').config();

const DATABASE_URL: string = process.env.MONGODB_TEST_DATABASE_URL || '';
const db = mongoose.connect(
    DATABASE_URL, 
    {useNewUrlParser: true}
);

const email: string = 'andershallemiversen@hotmail.com';
const password: string = '1234abcd';
const nickname: string = 'andorr';
let accountId: ?string = null;

// requests and reponses
const buildResponse: Function = () => (http_mocks.createResponse({eventEmitter: require('events').EventEmitter}));
const createUserRequest: Object = {method: 'POST', url: 'account/signup', body: {email: email, password: password, nickname: nickname}};
const loginRequest: Object = {method: 'POST', url: 'account/login', body: {email: email, password: password}};
const deleteRequest: Function = (userId: string) => ({method: 'DELETE', url: 'account/', params: {userId: userId}, userData: {userId: userId}});
const getUserRequest: Function = (id: string) => ({method: 'GET', url: 'account/', userData: {userId: id}});

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

describe('Testing user controller', () => {
    beforeAll((done: Function) => {
        // Drop data
        User.deleteMany({}, (err: Error) => {
            done();
        });
    });
     
    afterAll((done: Function) => {
        // Disconnect
        const { connections } = mongoose;
        for (const con of connections) {
            return con.close();
        }
        return mongoose.disconnect();
    });
     
    test('Create user', (done: Function) => {
        // Create requests and response
        const response: MockResponse = buildResponse();
        const request: MockRequest = http_mocks.createRequest(createUserRequest);
        response.on('end', () => {
            expect(response.statusCode).toBe(201);
            // Check if user was created
            User.findOne({email: email}, (err: Error, user: User) => {
                expect(user.email === email).toBeTruthy();
                expect(user.nickname === nickname).toBeTruthy();
                accountId = user._id;
                done();
            });
        });
        
        // Send request
        controller.user_create(request, response);
    });


    test('Test login', (done: Function) => {
        // Create requests and response
        const response: MockResponse = buildResponse();
        const request: MockRequest = http_mocks.createRequest(loginRequest);
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

    test('Get user info', (done: Function) => {
        // Get user id
        User.findOne({}, (err: Error, user: User) => {
            expect(err).toBeNull();
            const userId: string = user._id; // UserId

            // Mock request and response
            const response: MockResponse = buildResponse();
            const request: MockRequest = http_mocks.createRequest(getUserRequest(userId));
            response.on('end', () => {
                expect(response.statusCode).toBe(200);
                const data = JSON.parse(response._getData());
                expect(data.nickname).toBe(user.nickname);
                expect(data.email).toBe(user.email);
                done();
            });

            controller.user_get(request, response);
        });
        
    });

    test('Delete user', (done) => {
        // Get user id
        User.findOne({}, (err, user) => {
            if(err) {
                console.log(err);
            }
            expect(err).toBeNull();
            const userId: string = user._id; // UserId

            // Mock request and response
            const response: MockResponse = buildResponse();
            const request: MockRequest = http_mocks.createRequest(deleteRequest(userId));
            response.on('end', () => {
                expect(response.statusCode).toBe(200);

                // Check if user was deleted
                User.findById(userId, (err: Error, foundUser: User) => {
                    expect(foundUser).toBeNull();
                    done();
                });
            });

            controller.user_delete(request, response);
        });
    });
});
