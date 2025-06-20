import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

export default socket; 