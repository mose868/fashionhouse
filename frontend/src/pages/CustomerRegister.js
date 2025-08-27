import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getReferralData, clearReferralData } from '../components/common/ReferralTracker';
import axios from 'axios';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralData, setReferralData] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check for referral data when component loads
  useEffect(() => {
    const referral = getReferralData();
    if (referral) {
      setReferralData(referral);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Optional stronger password check (uppercase, lowercase, number) without special char
    const simplePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*/;
    if (!simplePasswordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (formData.phone.trim() === '') {
      setError('Phone number is required');
      return;
    }

    // Simple Kenyan phone validation (starts with +254 or 0 and 9-12 digits)
    const phoneRegex = /^(?:\+?254|0)?[17]?[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration with:', {
        ...formData,
        password: '[REDACTED]'
      });
      
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      };

      // Add referral data if present
      if (referralData) {
        registrationData.referralCode = referralData.referralCode;
      }

      const response = await axios.post('/api/auth/register', registrationData);

      console.log('Response status:', response.status);
      const data = response.data;
      console.log('Response data:', data);

      if (response.status === 201 || response.status === 200) {
        let successMessage = data.message || 'Registration successful!';
        
        // Add referral success message if applicable
        if (referralData) {
          successMessage += ` You were referred by ${referralData.ambassadorName}. You'll earn them commission on your purchases!`;
          clearReferralData(); // Clear referral data after successful registration
        }
        
        setSuccess(successMessage);
        
        // Navigate to verification page - backend automatically sends code
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 1000);
      } else {
        // Check if verification is required (signup now returns 400 with requiresEmailVerification)
        if (data.requiresEmailVerification) {
          let successMessage = data.message || 'Account created! Verification code sent to your email.';
          
          // Add referral success message if applicable
          if (referralData) {
            successMessage += ` You were referred by ${referralData.ambassadorName}. You'll earn them commission on your purchases!`;
            clearReferralData(); // Clear referral data after successful registration
          }
          
          setSuccess(successMessage);
          
          // Navigate to verification page
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          }, 1000);
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please check your connection and try again.';
      setError(errorMessage);
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
              Join Higi Fashion
            </motion.h1>
            <p className="text-gray-600">Create your account to start shopping</p>
          </div>

          {/* Error/Success Messages */}
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

          {/* Referral Notification */}
          {referralData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 px-4 py-3 rounded-lg mb-6"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    You were referred by {referralData.ambassadorName}!
                  </p>
                  <p className="text-xs text-purple-600">
                    They'll earn commission on your purchases, supporting their work as a Higi ambassador.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9+]{7,15}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="+254 XXX XXX XXX"
              />
            </div>

            {/* Password Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="Min 6 chars, include A-Z, a-z, 0-9"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-gold hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-gold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button Container */}
            <div className="mt-6 relative">
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  position: 'relative',
                  display: 'block'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account{'? '}
              <Link
                to="/login"
                style={{
                  color: '#f59e0b',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Removed social registration buttons */}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerRegister; 