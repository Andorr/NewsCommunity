// @flow 
const WebSocket = require('ws');
import type{Server} from 'http';

const AUTH: string = 'auth';
const MESSAGE: string = 'message';

class WS {

    wss: WebSocket.Server;

    constructor() {
        this.wss = null;
    }

    init(server: Server) {
        // Starting server
        this.wss = new WebSocket.Server({server});
        console.log("Websocket started");
        this.wss.on('open', () => {
            console.log("Websocket started");
        });

        // On client connected
        this.wss.on('connection', (ws: WebSocket.Server) => {
            console.log('Client connected');

            ws.on('message', (messageData) => {
                const msg: Object = JSON.parse(messageData);
            
                // If message type is auth, save user id
                if(msg && msg.type === AUTH) {
                    ws.id = msg.userId;
                } 
                // If message type is message, send to all clients
                else if(msg && msg.type === MESSAGE) {
                    this.wss.clients.forEach((client) => {
                        client.send(JSON.stringify(msg));
                    });
                }

            });
        });
    }

    // Send message to all client
    send(msg: Object) {

        if(this.wss === null || !msg) {
            return;
        }
        // For every
        const message: Object = JSON.parse(JSON.stringify(msg)); // Makes a deep copy, which is not readonly
        this.wss.clients.forEach((client) => {

            // Check if client has voted for the news item
            if(message.votes && client.id) {
                message.isVoted = message.votes.findIndex((vote) => vote.user === client.id) >= 0;
            } else {
                message.isVoted = false;
            }
            
            // Send message
            const stringified: string = JSON.stringify(message);
            client.send(stringified);
        });
    }
}

const ws = new WS();

module.exports = ws;
