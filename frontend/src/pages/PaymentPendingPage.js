import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentPendingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order);
  const [checkoutRequestId] = useState(location.state?.checkoutRequestId);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Poll for payment status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/payments/mpesa/status/${orderId}`);
        const newStatus = response.data.paymentStatus;
        
        if (newStatus !== paymentStatus) {
          setPaymentStatus(newStatus);
          
          if (newStatus === 'paid') {
            toast.success('Payment completed successfully!');
            clearInterval(interval);
            setTimeout(() => {
              navigate(`/order-confirmation/${orderId}`);
            }, 2000);
          } else if (newStatus === 'failed') {
            toast.error('Payment failed. Please try again.');
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000);

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'pending') {
        toast.error('Payment timeout. Please try again.');
      }
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId, paymentStatus, navigate]);

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetryPayment = async () => {
    setIsLoading(true);
    try {
      // Navigate back to checkout to retry
      navigate('/checkout');
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast.error('Failed to retry payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      // TODO: Add cancel order API call
      toast.success('Order cancelled');
      navigate('/cart');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {paymentStatus === 'pending' && (
                  <ClockIcon className="h-16 w-16 text-yellow-500 animate-pulse" />
                )}
                {paymentStatus === 'paid' && (
                  <CheckCircleIcon className="h-16 w-16 text-green-500" />
                )}
                {paymentStatus === 'failed' && (
                  <XCircleIcon className="h-16 w-16 text-red-500" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {paymentStatus === 'pending' && 'Payment Pending'}
                {paymentStatus === 'paid' && 'Payment Successful!'}
                {paymentStatus === 'failed' && 'Payment Failed'}
              </h1>
              
              <p className="text-gray-600">
                {paymentStatus === 'pending' && 'Please complete your M-Pesa payment'}
                {paymentStatus === 'paid' && 'Your order has been confirmed'}
                {paymentStatus === 'failed' && 'Your payment was not completed'}
              </p>
            </div>

            {/* Order Details */}
            {order && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{order._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">KES {order.total?.toLocaleString()}</span>
                  </div>
                  {checkoutRequestId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium text-sm">{checkoutRequestId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            {paymentStatus === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-blue-500 mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Complete Your Payment
                    </h3>
                    <ul className="text-blue-800 space-y-2">
                      <li>• Check your phone for M-Pesa STK Push notification</li>
                      <li>• Enter your M-Pesa PIN when prompted</li>
                      <li>• Wait for payment confirmation</li>
                      <li>• This page will update automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Timer */}
            {paymentStatus === 'pending' && (
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-2">Time elapsed</div>
                <div className="text-2xl font-mono font-bold text-gray-900">
                  {formatTime(timeElapsed)}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {paymentStatus === 'pending' && (
                <>
                  <button
                    onClick={handleRetryPayment}
                    disabled={isLoading}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Retry Payment'}
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isLoading}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Cancel Order'}
                  </button>
                </>
              )}
              
              {paymentStatus === 'paid' && (
                <button
                  onClick={() => navigate(`/order-confirmation/${orderId}`)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  View Order Details
                </button>
              )}
              
              {paymentStatus === 'failed' && (
                <button
                  onClick={() => navigate('/checkout')}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="tel:+254700000000" className="text-gold-600 hover:text-gold-700">
                  +254 700 000 000
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage; 