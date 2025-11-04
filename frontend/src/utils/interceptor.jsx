
// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api', // Your backend's base URL
// });

// // Request Interceptor: Attaches the token to every request
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// // Response Interceptor: Checks for expired tokens on every response
// api.interceptors.response.use(
//   (response) => response, // Pass through successful responses
//   (error) => {
//     // Check if the error is a 401 Unauthorized error
//     if (error.response && error.response.status === 401) {
//       console.log("Session expired. Logging out.");
      
//       // Remove the expired token
//       localStorage.removeItem('accessToken');
      
//       // Redirect to the login page. The reload is important to clear all app state.
//       window.location.href = '/login'; 
//     }
    
//     // For all other errors, just pass them along
//     return Promise.reject(error);
//   }
// );

// export default api;



// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'https://a118d7ee0dab.ngrok-free.app/api',
// });

// // Request Interceptor: Attaches the token AND ngrok bypass header
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
  
//   // Add ngrok bypass header
//   config.headers['ngrok-skip-browser-warning'] = 'true';
  
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// // Response Interceptor: (keep as is)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       console.log("Session expired. Logging out.");
//       localStorage.removeItem('accessToken');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;




import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Request Interceptor: Attaches the token and ngrok header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Session expired. Logging out.");
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
