import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AdminApp from './AdminApp';

// Force admin mode
window.REACT_APP_ADMIN = 'true';
process.env.REACT_APP_ADMIN = 'true';

// Set admin-specific configuration
document.title = 'Fashion House - Admin Portal';
console.log('Admin portal starting on port 3002...');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
); 