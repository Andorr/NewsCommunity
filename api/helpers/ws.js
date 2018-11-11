// @flow 
const WebSocket = require('ws');
import type{Server} from 'http';

const AUTH: string = 'auth';
const MESSAGE: string = 'message';
const PING: string = 'ping';

function heartbeat(): void {
    this.isAlive = true;
}

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
            ws.isAlive = true;
            ws.on('message', (messageData) => {
                const msg: Object = JSON.parse(messageData);
            
                // If message was an ping
                if(msg && msg.type === PING) {
                    ws.isAlive = true;
                    ws.send(PING);
                    console.log("PING RECIEVED");
                }
                // If message type is auth, save user id
                else if(msg && msg.type === AUTH) {
                    ws.id = msg.userId;
                }
                // If message type is message, send to all clients
                else if(msg && msg.type === MESSAGE) {
                    this.wss.clients.forEach((client) => {
                        client.send(JSON.stringify(msg));
                    });
                }
                ws.isAlive = true;
            });

            // On pong message recieved, keep socket alive
        });

        // Terminate connections if not alive
        const interval: IntervalID = setInterval(() => {
            this.wss.clients.forEach((client: WebSocket.Server) => {
                console.log("Is client alive? " + client.isAlive);
                if(client.isAlive === false) {
                    console.log("DISCONNECTED CLIENT");
                    return client.terminate()
                };
                client.isAlive = false;
                
            });
        }, 30000);
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
