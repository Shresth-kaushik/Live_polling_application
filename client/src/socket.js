import { io } from 'socket.io-client';

const SOCKET_URL = 'https://live-polling-application-1.onrender.com';

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
