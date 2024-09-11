// Importamos los módulos necesarios
const express = require('express'); // Framework web para manejar el servidor HTTP
const http = require('http'); // Módulo para crear un servidor HTTP
const WebSocket = require('ws'); // Módulo para crear y manejar conexiones WebSocket
const path = require('path'); // Módulo para manejar rutas de archivos en el sistema

// Inicializamos la aplicación de Express
const app = express();

// Creamos un servidor HTTP utilizando Express
const server = http.createServer(app);

// Creamos un servidor WebSocket adjunto al servidor HTTP
const wss = new WebSocket.Server({ server });

// Variables para manejar el estado del sistema y los tiempos de llenado
let lastData = {}; // Guarda los últimos datos enviados por el cliente
let states = []; // Guarda los estados recibidos
let fullTimes = []; // Guarda los tiempos en los que el tacho está lleno
let averageFillTime = 0; // Tiempo promedio que tarda en llenarse el tacho

// Evento que se dispara cuando un cliente WebSocket se conecta
wss.on('connection', ws => {
  
  // Evento que se dispara cuando el servidor recibe un mensaje del cliente
  ws.on('message', message => {
    
    // Convierte el mensaje recibido de JSON a objeto
    const data = JSON.parse(message);
    
    // Actualiza los últimos datos recibidos y añade una marca de tiempo
    lastData = { ...data, timestamp: new Date().toLocaleString() };
    
    // Si el estado es "Lleno", registra el tiempo y calcula el promedio de llenado
    if (data.estado === 'Lleno') {
      fullTimes.push(data.timestamp); // Añade el tiempo actual a la lista de "Lleno"
      calculateAverageFillTime(); // Calcula el tiempo promedio de llenado
    }

    // Añade los últimos datos al historial de estados
    states.push(lastData);
    
    // Envía los últimos datos y el tiempo promedio de llenado a todos los clientes conectados
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) { // Verifica si la conexión está abierta
        client.send(JSON.stringify({ ...lastData, averageFillTime })); // Envía los datos en formato JSON
      }
    });
  });
});

// Función para calcular el tiempo promedio de llenado del tacho
function calculateAverageFillTime() {
  if (fullTimes.length >= 2) { // Necesitamos al menos 2 tiempos de llenado para calcular el promedio
    // Calcula el tiempo total entre el primer y el último llenado
    const totalFillTime = fullTimes[fullTimes.length - 1] - fullTimes[0];
    
    // Divide el tiempo total por la cantidad de ciclos (llenados) para obtener el promedio
    averageFillTime = totalFillTime / (fullTimes.length - 1);
  }
}

// Middleware de Express para servir archivos estáticos (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// El servidor HTTP escucha en el puerto 3000
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
