import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AdminApp from './AdminApp';

// Admin-specific configuration
document.title = 'Fashion House - Management';
console.log('Admin portal starting...');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
); 