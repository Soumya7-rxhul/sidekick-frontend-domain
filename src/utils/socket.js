import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
