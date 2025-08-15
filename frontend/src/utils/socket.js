
import { io } from 'socket.io-client';

// IMPORTANT: Replace with your backend URL
const SOCKET_URL = 'http://localhost:3000'; 

export const socket = io(SOCKET_URL, {
    autoConnect: false // We will connect manually from our components
});