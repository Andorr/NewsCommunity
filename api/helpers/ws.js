const WebSocket = require('ws');

const AUTH = 'auth';
const MESSAGE = 'message';

class WS {

    constructor() {
        this.wss = null;
    }

    init(server) {
        // Starting server
        this.wss = new WebSocket.Server({server});
        console.log("Websocket started");
        this.wss.on('open', () => {
            console.log("Websocket started");
        });

        // On client connected
        this.wss.on('connection', (ws) => {
            console.log('Client connected');

            ws.on('message', (messageData) => {
                const msg = JSON.parse(messageData);
            
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
            ws.on('disconnect', () => {
                delete this.clients[ws.id];
            })
        });
    }

    // Send message to all client
    send(msg) {

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
            const stringified = JSON.stringify(message);
            client.send(stringified);
        });
    }
}

const ws = new WS();

module.exports = ws;
