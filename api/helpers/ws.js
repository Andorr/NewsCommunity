const WebSocket = require('ws');
let wss = null;

exports.init = (server) => {
    wss = new WebSocket.Server({server});
    console.log("Websocket started");
    wss.on('open', () => {
        console.log("Websocket started");
    });

    wss.on('connection', (ws) => {

        console.log("Connected");
        ws.on('message', (msg) => {
            console.log('received: %s', msg);
            
            wss.clients.forEach((client) => {
                if(client != ws) {
                    client.send(msg);
                }
            });
        });
        ws.send('Welcome! :D');
    });
};

exports.wss = wss;

exports.onmessage = (callback) => {
    if(wss === null) {
        return;
    }

    wss.on('message', (data) => {
        callback(wss, data);
    });
}