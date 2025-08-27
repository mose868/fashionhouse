import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminNavbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: 'users', label: 'Users', icon: '👥' },
    { path: 'products', label: 'Products', icon: '📦' },
    { path: 'orders', label: 'Orders', icon: '📋' },
    { path: 'contacts', label: 'Contacts', icon: '💬' },
    { path: 'marketing', label: 'Marketing', icon: '📢' },
    { path: 'ai', label: 'AI Tools', icon: '🤖' },
    { path: 'loyalty', label: 'Loyalty', icon: '🎁' },
    { path: 'ambassadors', label: 'Ambassadors', icon: '🌟' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAccessGranted');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-bold text-gray-900">Fashion House</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.replace(/^\/admin\/?/, '') === (item.path || '')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Admin Portal
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Exit Portal
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 