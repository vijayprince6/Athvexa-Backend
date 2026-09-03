import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

// Set the global backend URL for all API requests
// TEMPORARY FIX: Hardcoded to use deployed Render backend
// The .env file was not being loaded reliably, so we're using the live backend directly
const getBaseURL = () => {
  // Always use the deployed Render backend
  return 'https://athvexa-backend.onrender.com';
  
  // Original code (kept for reference):
  // if (process.env.REACT_APP_API_URL) {
  //   return process.env.REACT_APP_API_URL;
  // }
  // const hostname = window.location.hostname;
  // return `http://${hostname}:10000`;
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
