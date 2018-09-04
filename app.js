const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const db = mongoose.connect('mongodb://andorr:1234abcd@ds243812.mlab.com:43812/tdat2003_oving03', { useNewUrlParser: true });
const app = express();

// Middleware

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// Parse json
app.use(bodyParser.json());

// Routes
app.use(require('./controllers'))

const server = app.listen(8080);