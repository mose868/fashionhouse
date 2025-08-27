// Admin Authentication Utility
export const getAdminToken = () => {
  const adminAccessGranted = localStorage.getItem('adminAccessGranted') === 'true';
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminAccessGranted || !adminToken) {
    return null;
  }
  
  return adminToken;
};

export const isAdminAuthenticated = () => {
  return getAdminToken() !== null;
};

export const getAdminHeaders = () => {
  const token = getAdminToken();
  
  if (!token) {
    throw new Error('Admin authentication required');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const handleAdminAuthError = (error) => {
  if (error.message === 'Admin authentication required' || 
      error.message.includes('Invalid admin token') ||
      error.message.includes('Admin access required')) {
    // Clear invalid admin data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAccessGranted');
    
    // Redirect to secret key entry
    window.location.href = '/';
    return true; // Error was handled
  }
  return false; // Error was not handled
}; 