import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CustomerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const from = '/';

  // Check for verification success
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccess('Email verified successfully! Please sign in to continue.');
    }
    
    // Auto-fill email if provided
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login for:', formData.email);

    try {
      await login(formData.email, formData.password);
      console.log('Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      console.log('Error response data:', err.response?.data);
      console.log('Error status:', err.response?.status);
      
      const errorData = err.response?.data;
      const message = errorData?.message || 'Login failed. Please try again.';
      
      // Handle login verification required (always true now)
      if (errorData?.requiresEmailVerification) {
        console.log('Verification code required, redirecting to login verification page...');
        // Persist credentials temporarily in sessionStorage (avoid query param exposure of password)
        sessionStorage.setItem('pendingLoginEmail', formData.email);
        sessionStorage.setItem('pendingLoginPassword', formData.password);

        navigate(`/verify-login?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-gold/10 py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-playfair font-bold text-navy mb-2"
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-600">Sign in to your Higi Fashion account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="john@example.com"
                autoFocus // Auto-focus email field
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account{'? '}
              <Link
                to="/register"
                className="text-gold hover:underline font-medium"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Guest Checkout */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Just want to place an order?
            </p>
            <Link
              to="/checkout"
              className="text-gold hover:underline font-medium"
            >
              Continue as Guest
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerLogin; 