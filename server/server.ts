import * as http from 'http';
import * as WebSocket from 'ws';

const hostname = 'localhost';
const port = 9999;

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {

  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
