import * as WebSocket from 'ws';
import { URLSearchParams } from 'url';

const port = 9999;
const webSocketServer = new WebSocket.Server({ port: port });

const clients: { [browserId: string]: WebSocket } = {};

webSocketServer.on('connection', (ws: WebSocket, req) => {
  let browserId: string | null = null;

  if (req.url) {
    const queryParams = new URLSearchParams(req.url.substring(1));
    browserId = queryParams.get('screen');

    if (browserId) {
      clients[browserId] = ws;
    }
  }

  ws.on('message', (message) => {
    if (browserId) {
      Object.keys(clients).forEach((id) => {
        if (id !== browserId && clients[id].readyState === WebSocket.OPEN) {
          clients[id].send(message);
        }
      });
    }
  });

  ws.on('close', () => {
    if (browserId) {
      delete clients[browserId];
    }
  });
});
