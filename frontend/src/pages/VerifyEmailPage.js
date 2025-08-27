import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VerifyEmailPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const email = searchParams.get('email') || '';

  // Redirect if no email param
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch('/api/auth/verify-code', { email, code });
      const data = res.data;

      if (res.status === 200) {
        setSuccess('Email verified successfully! You can now sign in.');
        
        // Redirect to login with success message and pre-filled email
        setTimeout(() => {
          navigate(`/login?verified=true&email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data.message || 'Failed to verify email');
      }
    } catch (err) {
      console.error('Verify code error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to verify email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const res = await axios.post('/api/auth/send-code', { email, purpose: 'signup' });
      const data = res.data;

      if (res.status === 200) {
        setSuccess('New verification code sent to your email');
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Resend code error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
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
              Verify Your Email
            </motion.h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to <strong>{email}</strong>
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
          <form onSubmit={handleVerifyCode} className="space-y-6">
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
              {loading ? 'Verifying...' : 'Verify Email'}
            </motion.button>
          </form>

          {/* Resend Code */}
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-gold hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Back to Register */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Wrong email address?{' '}
              <Link to="/register" className="text-gold hover:underline font-medium">
                Sign up again
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 