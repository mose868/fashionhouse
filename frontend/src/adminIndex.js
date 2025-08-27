import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AdminApp from './AdminApp';

// Set admin-specific environment
if (process.env.REACT_APP_ADMIN) {
  document.title = 'Fashion House - Management';
  console.log('Admin portal starting...');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
); 