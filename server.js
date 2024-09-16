const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { trainModel, predictFillTime } = require('./ml/ml'); // Importar la red neuronal

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

    // Guardar el tiempo de llenado si el estado es "Lleno"
    if (data.estado === 'Lleno') {
      fullTimes.push(data.timestamp);
      calculateAverageFillTime();
    }

    // Guardar el estado para entrenar la red neuronal
    if (data.estado !== 'Lleno') {
      states.push({ distancia: data.distancia, tiempoParaLlenar: averageFillTime });
    }

    // Entrenar la red neuronal
    if (states.length > 5) {
      trainModel(states);
    }

    // Hacer predicción si la red ha sido entrenada y el estado no es "Lleno"
    if (data.estado !== 'Lleno' && states.length > 5) {
      try {
        const predictedTime = predictFillTime(data.distancia);
        lastData.predictedFillTime = predictedTime;
      } catch (error) {
        console.error(error.message);
      }
    }

    // Enviar los datos a todos los clientes conectados
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...lastData, averageFillTime }));
      }
    });
  });
});

function calculateAverageFillTime() {
  if (fullTimes.length >= 2) {
    const totalFillTime = fullTimes[fullTimes.length - 1] - fullTimes[0];
    averageFillTime = totalFillTime / (fullTimes.length - 1);
  }
}

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
