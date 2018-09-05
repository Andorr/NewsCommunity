const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer(require('./app'));

server.listen(port);