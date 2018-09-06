const http = require('http');
const wss = require('./api/helpers/ws');

const port = process.env.PORT || 8080;

const server = http.createServer(require('./app'));
wss.init(server);

server.listen(port);
