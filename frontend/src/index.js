import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AdminApp from './AdminApp';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Determine admin mode via env, runtime flag, port or query string (?admin=1)
const getIsAdmin = () => {
  try {
    const viaEnv = process.env.REACT_APP_ADMIN === 'true';
    const viaRuntime = typeof window !== 'undefined' && window.REACT_APP_ADMIN === 'true';
    const viaPort = typeof window !== 'undefined' && window.location.port === '3002';
    const viaQuery = (() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const v = (params.get('admin') || '').toLowerCase();
        return v === '1' || v === 'true';
      } catch (_) {
        return false;
      }
    })();
    return viaEnv || viaRuntime || viaPort || viaQuery;
  } catch (_) {
    return false;
  }
};

const isAdmin = getIsAdmin();

console.log('Port:', window.location.port);
console.log('Admin mode:', isAdmin);

root.render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 