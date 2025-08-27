import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

/**
 * ForgotPasswordPage
 * -------------------
 * Allows users to request a verification code via e-mail and subsequently
 * reset their password using that code.
 *
 * Flow:
 * 1. User enters email → POST /api/auth/send-code { email, purpose:"reset" }
 * 2. After success, UI switches to code/password form.
 * 3. User submits code + new password → PATCH /api/auth/reset-password
 * 4. On success, redirect to /login.
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const navigate = useNavigate();

  // Ensure reset form appears once a code has been sent
  useEffect(() => {
    if (codeSent) {
      setShowResetForm(true);
    }
  }, [codeSent]);

  // --- Helpers -----------------------------------------------------------
  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  // --- Send Code ---------------------------------------------------------
  const handleSendCode = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/send-code', { email, purpose: 'reset' });
      const data = res.data;

      if (res.status === 200) {
        setCodeSent(true);
        setShowResetForm(true);
        setSuccess(data.message || 'Verification code sent to your email');
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Send code error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Reset Password ----------------------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch('/api/auth/reset-password', { email, code, newPassword: password });
      const data = res.data;

      if (res.status === 200) {
        setSuccess(data.message || 'Password reset successfully!');
        // Redirect to login after short delay
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Render -----------------------------------------------------------
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
              {showResetForm ? 'Reset Your Password' : 'Forgot Password'}
            </motion.h1>
            <p className="text-gray-600">
              {showResetForm
                ? 'Enter the verification code we emailed you and choose a new password.'
                : 'We will send a 6-digit verification code to your email.'}
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

          {/* Forms */}
          {!showResetForm ? (
            /* ---------------- Request Code Form ---------------- */
            <form onSubmit={handleSendCode} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : 'Send Verification Code'}
              </motion.button>
            </form>
          ) : (
            /* ---------------- Reset Password Form ---------------- */
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Code */}
              {email === '' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all tracking-widest text-center"
                  placeholder="123456"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="Re-enter new password"
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </motion.button>
            </form>
          )}

          {/* Back to login */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Remembered your password?{' '}
              <Link to="/login" className="text-gold hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>

          {/* Link to show reset form */}
          {!showResetForm && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="mt-4 text-sm text-gold hover:underline focus:outline-none"
              >
                Already have a code?
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 