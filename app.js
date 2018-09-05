const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const db = mongoose.connect(
    'mongodb://andorr:' +
    process.env.MONGODB_PASSWORD +
    '@ds243812.mlab.com:43812/tdat2003_oving03', 
    {useNewUrlParser: true}
);

// Tell mongodb to use javascript Promises
mongoose.Promise = global.Promise;

const app = express();

// Logging
app.use(morgan('dev'));

// Middleware
app.use('/images', express.static('images')); // Makes the folder public

// Parsing
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // Parse json

// Cors headers
app.use((req, res, next) => {
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
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Universal error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
});

module.exports = app;