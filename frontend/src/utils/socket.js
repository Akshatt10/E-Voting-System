
import { io } from 'socket.io-client';

// IMPORTANT: Replace with your backend URL
const SOCKET_URL = 'https://a118d7ee0dab.ngrok-free.app '; 

export const socket = io(SOCKET_URL, {
    autoConnect: false // We will connect manually from our components
});