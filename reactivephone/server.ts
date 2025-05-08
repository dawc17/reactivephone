import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Allow requests from your React app's origin
// Adjust the origin if your React app runs on a different port
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Assuming Vite default
    methods: ['GET', 'POST'],
  },
});

// Define types (should match client-side)
interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  brushColor: string;
  brushRadius: number;
  tool?: string;
}

// In-memory store for the current canvas state: an array of Stroke objects
let currentCanvasStrokes: Stroke[] = [];

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  socket.on('requestInitialCanvas', () => {
    // Send the current array of strokes directly
    if (currentCanvasStrokes.length > 0) {
      socket.emit('initialCanvas', currentCanvasStrokes);
    }
  });

  socket.on('newStroke', (strokeData: Stroke) => {
    console.log('Received new stroke from', socket.id);
    currentCanvasStrokes.push(strokeData);
    // Broadcast the new stroke object to all other clients
    socket.broadcast.emit('newStrokeBroadcast', strokeData);
  });

  socket.on('clearCanvas', () => {
    console.log('Received clearCanvas from', socket.id);
    currentCanvasStrokes = []; // Reset to an empty array
    socket.broadcast.emit('clearCanvasBroadcast');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Need to install cors: npm install cors && npm install --save-dev @types/cors 