// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://a118d7ee0dab.ngrok-free.app/api', // Your backend's base URL
});

// Request Interceptor: Attaches the token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response Interceptor: Checks for expired tokens on every response
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.log("Session expired. Logging out.");
      
      // Remove the expired token
      localStorage.removeItem('accessToken');
      
      // Redirect to the login page. The reload is important to clear all app state.
      window.location.href = '/login'; 
    }
    
    // For all other errors, just pass them along
    return Promise.reject(error);
  }
);

export default api;