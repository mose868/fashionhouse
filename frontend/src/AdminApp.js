import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminContacts from './pages/admin/AdminContacts';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminAI from './pages/admin/AdminAI';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLoyalty from './pages/admin/AdminLoyalty';
import AdminAmbassadors from './pages/admin/AdminAmbassadors';

// Admin Components
import AdminNavbar from './components/admin/AdminNavbar';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Secret Access Component
const SecretAccess = ({ onAccessGranted }) => {
  const [secretKey, setSecretKey] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // The secret key - change this to your own secret
  const CORRECT_SECRET = 'fashionhouse2024admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (locked) {
      return;
    }

    if (secretKey === CORRECT_SECRET) {
      // Store admin access and generate a simple token
      localStorage.setItem('adminAccessGranted', 'true');
      localStorage.setItem('adminToken', 'admin-secret-access-token');
      localStorage.setItem('adminUser', JSON.stringify({
        id: 'admin',
        email: 'admin@fashionhouse.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isAdmin: true
      }));
      onAccessGranted();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 30000); // 30 second lockout
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal Access</h1>
          <p className="text-gray-600">Enter the secret access key to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Access Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter secret key"
              disabled={locked}
            />
          </div>
          
          {attempts > 0 && (
            <div className="text-red-600 text-sm">
              Invalid key. {3 - attempts} attempts remaining.
            </div>
          )}
          
          {locked && (
            <div className="text-red-600 text-sm">
              Access temporarily locked. Try again in 30 seconds.
            </div>
          )}
          
          <button
            type="submit"
            disabled={locked || !secretKey}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locked ? 'Access Locked' : 'Access Admin Portal'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure access required for system management
          </p>
        </div>
      </div>
    </div>
  );
};

function AdminApp() {
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const hasAccess = localStorage.getItem('adminAccessGranted') === 'true';
    setAccessGranted(hasAccess);
  }, []);

  if (!accessGranted) {
    return <SecretAccess onAccessGranted={() => setAccessGranted(true)} />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-gray-100">
                <AdminNavbar />
                <main className="flex-1">
                  <Routes>
                    {/* Admin Dashboard */}
                    <Route path="/" element={<AdminDashboard />} />
                    
                    {/* Admin Management Routes */}
                    <Route path="/products" element={<AdminProducts />} />
                    <Route path="/orders" element={<AdminOrders />} />
                    <Route path="/contacts" element={<AdminContacts />} />
                    <Route path="/marketing" element={<AdminMarketing />} />
                    <Route path="/ai" element={<AdminAI />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/loyalty" element={<AdminLoyalty />} />
                    <Route path="/ambassadors" element={<AdminAmbassadors />} />
                    
                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default AdminApp; 