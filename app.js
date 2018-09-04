const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const db = mongoose.connect(
    'mongodb://andorr:1234abcd@ds243812.mlab.com:43812/tdat2003_oving03', 
    {useNewUrlParser: true}
);
mongoose.Promise = global.Promise;

const app = express();

// Middleware
app.use('/images', express.static('images')); // Makes the folder public

// Parsing
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // Parse json

// Routes
app.use(require('./controllers'))

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
});

const server = app.listen(8080);