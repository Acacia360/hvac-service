/**
 * wsHub.service.js
 * Pushes live HVAC state changes to connected frontend WebSocket clients.
 * Fed by AE200Client#onStateUpdate — no polling on this side either.
 */

const { WebSocketServer } = require('ws');

let wss = null;

/** Attach the frontend WS server onto the existing HTTP server, at /ws/hvac */
function init(server) {
    wss = new WebSocketServer({ server, path: '/ws/hvac' });
    wss.on('connection', (socket) => {
        console.log(`[WS] Frontend client connected (${wss.clients.size} total)`);
        socket.on('close', () => console.log(`[WS] Frontend client disconnected (${wss.clients.size} total)`));
    });
    console.log('[WS] Frontend hub listening at /ws/hvac');
}

/** Push a state change for one controller's group(s) to every connected frontend client */
function broadcast(ip, states) {
    if (!wss) return;
    const payload = JSON.stringify({ ip, states, at: new Date().toISOString() });
    for (const client of wss.clients) {
        if (client.readyState === client.OPEN) client.send(payload);
    }
}

module.exports = { init, broadcast };
