import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

// Set the global backend URL for all API requests
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://athvexa-backend.onrender.com'
    : 'http://localhost:10000';
};
axios.defaults.baseURL = getBaseURL();

// Debug: Log the baseURL to verify it's correct
console.log('🔧 Axios baseURL configured:', axios.defaults.baseURL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
