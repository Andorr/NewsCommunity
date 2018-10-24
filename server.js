// @flow

const http = require('http');
const wss = require('./api/helpers/ws');
const dotenv = require('dotenv');
dotenv.config();

let port: any = process.env.PORT || 8080;

const server = http.createServer(require('./app'));
wss.init(server);

server.listen(port);
