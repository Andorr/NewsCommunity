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

            ws.on('message', (msg) => {
            
                // If message type is auth, save user id
                if(msg && msg.type === AUTH) {
                    ws.user = msg.id;
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
        const message: Object = msg;
        this.wss.clients.forEach((client) => {

            // Check if client has voted for the news item
            if(message.votes && client.user) {
                message.isVoted = message.votes.indexOf((vote) => vote.user === client.user) >= 0;
            } else {
                message.isVoted = false;
            }
            
            // Send message
            console.log("Sending: ", message);
            client.send(JSON.stringify(message));
        });
    }
}

const ws = new WS();

module.exports = ws;
