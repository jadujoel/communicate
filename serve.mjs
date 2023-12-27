import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { resolve } from 'path';
import { Server } from 'socket.io';

const httpApp = express();
httpApp.use(cors());

const sslApp = express();
sslApp.use(cors());

try {
  start(
    http.createServer(httpApp),
    httpApp,
    8080
  )
} catch (e) {
  console.error(e)
}
try {
  start(https.createServer({
    key: fs.readFileSync(file`private.key`),
    cert: fs.readFileSync(file`certificate.crt`),
  }, sslApp),
  sslApp,
    8443
  );
} catch (e) {
  console.error(e)
}

/**
 * @param {http.Server | https.Server} server
 * @param {express.Express} app
 * @param {number} port
 * @returns {void}
 */
function start(server, app, port) {
  const io = new Server(server);
  const validation = file`11A934882D5862AF9BBFEDE453D6433F.txt`

  app.get('/', (req, res) => {
    res.sendFile(file`index.html`);
  });
  app.get(`/.well-known/pki-validation/${validation}`, (req, res) => {
    res.sendFile(validation);
});

  io.on('connection', (socket) => {
    // Handle WebRTC signaling
    socket.on('offer', (offer) => {
      // Relay the 'offer' to the other peer
      socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
      // Relay the 'answer' to the other peer
      socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
      // Relay the ICE candidate to the other peer
      socket.broadcast.emit('candidate', candidate);
    });
  });

  server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });
}

/**
 * Get the absolute path of a file
 * @param {string[]} strings
 * @param {...*} values
 * @returns {string}
 **/
function file(strings, ...values) {
  let result = "";
  strings.forEach((string, i) => {
      result += string + (values[i] || '');
  });
  return resolve(resolve(), result);
}
