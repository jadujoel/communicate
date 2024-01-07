#!/usr/bin/env node

import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const httpApp = express();
httpApp.use(cors());

try {
  start(
    http.createServer(httpApp),
    httpApp,
    8080
  )
} catch (e) {
  console.error(e)
}

/**
 * @param {http.Server} server
 * @param {express.Express} app
 * @param {number} port
 * @returns {void}
 */
function start(server, app, port) {
  const io = new Server(server);

  app.get('/', (req, res) => {
    res.sendFile(file`index.html`);
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
