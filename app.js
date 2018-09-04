const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use(require('./controllers'))

const server = app.listen(8080);