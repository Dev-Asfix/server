const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let lastData = {};
let states = [];
let fullTimes = [];
let averageFillTime = 0;

wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);
    lastData = { ...data, timestamp: new Date().toLocaleString() };
    
    if (data.estado === 'Lleno') {
<<<<<<< HEAD
      fullTimes.push(data.now());
=======
      fullTimes.push(data.timestamp);
>>>>>>> bf5751f (Version  Nueva)
      calculateAverageFillTime();
    }

    states.push(lastData);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...lastData, averageFillTime }));
      }
    });
  });
});

<<<<<<< HEAD
ws.onclose = () => {
  setTimeout(() => {
    ws = new WebSocket('ws://localhost:3000');
  }, 5000); // Intentar reconectar cada 5 segundos
};
=======
>>>>>>> bf5751f (Version  Nueva)


function calculateAverageFillTime() {
  if (fullTimes.length >= 2) {
    const totalFillTime = fullTimes[fullTimes.length - 1] - fullTimes[0];
<<<<<<< HEAD
    averageFillTime = totalFillTime / (fullTimes.length - 1)/1000;
=======
    averageFillTime = totalFillTime / (fullTimes.length - 1);
>>>>>>> bf5751f (Version  Nueva)
  }
}

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
