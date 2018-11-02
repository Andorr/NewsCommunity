const WebSocket = require('ws');

class WS {

    constructor() {
        this.wss = null;
    }

    init(server) {
        this.wss = new WebSocket.Server({server});
        console.log("Websocket started");
        this.wss.on('open', () => {
            console.log("Websocket started");
        });

        this.wss.on('connection', (ws) => {

            console.log("Connected");
            ws.on('message', (msg) => {
                this.wss.clients.forEach((client) => {
                    console.log(client);
                    if(client != ws) {
                        client.send(msg);
                    }
                });
            });
            ws.send(JSON.stringify({message: 'Welcome! :D'}));
        });
    }

    send(msg) {
        if(this.wss === null) {
            return;
        }
    
        this.wss.clients.forEach((client) => {
            client.send(JSON.stringify(msg));
        });
    }
}

const ws = new WS();

module.exports = ws;
