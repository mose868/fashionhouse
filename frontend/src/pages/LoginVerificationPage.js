import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LoginVerificationPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { login } = useAuth();

  const email = searchParams.get('email') || '';

  // Ensure we have email and pending password
  useEffect(() => {
    const pwd = sessionStorage.getItem('pendingLoginPassword');
    if (!email || !pwd) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    const password = sessionStorage.getItem('pendingLoginPassword');
    if (!password) {
      setError('Session expired. Please sign in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, code);
      // Clear temp credentials
      sessionStorage.removeItem('pendingLoginPassword');
      sessionStorage.removeItem('pendingLoginEmail');

      setSuccess('Login successful! Redirecting…');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Verification login error:', err);
      const message = err.response?.data?.message || 'Invalid or expired code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    const password = sessionStorage.getItem('pendingLoginPassword');
    try {
      await axios.post('/api/auth/login', { email, password });
      setSuccess('A new verification code has been sent to your email');
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
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
              Enter Verification Code
            </motion.h1>
            <p className="text-gray-600">
              A 6-digit code was sent to <strong>{email}</strong>
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all tracking-widest text-center text-lg"
                placeholder="123456"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </motion.button>
          </form>

          {/* Resend Code */}
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-gold hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Sending…' : 'Resend Code'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginVerificationPage; 