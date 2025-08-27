import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  // Check for admin access granted via secret key
  const adminAccessGranted = localStorage.getItem('adminAccessGranted') === 'true';
  const adminToken = localStorage.getItem('adminToken');

  // If no admin access granted or token, redirect to secret key entry
  if (!adminAccessGranted || !adminToken) {
    // Clear any invalid data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAccessGranted');
    
    // Redirect to the root which will show the secret key entry
    return <Navigate to="/" replace />;
  }

  // If admin access is granted, render the protected component
  return children;
};

export default AdminProtectedRoute; 