const express = require('express');
import type{Express, $Request, $Response} from 'express';
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const WebSocket = require('ws');


const db = mongoose.connect(
    process.env.MONGODB_DATABASE_URL, 
    {useNewUrlParser: true}
);

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

const app: Express = express();

// Logging
app.use(morgan('dev'));

// Middleware
app.use('/images', express.static('images')); // Makes the folder public

// Parsing
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // Parse json

// Cors headers
app.use((req: $Request, res: $Response, next: Function) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use(require('./api/routes'))

// 404 Not Found
app.use((req: $Request, res: $Response, next: Function) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Universal error handler
app.use((error: Error, req: $Request, res: $Response, next: Function) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
});

module.exports = app;