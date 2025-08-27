import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`/api/orders/track/${orderNumber.trim()}`);
      const data = await response.json();

      if (response.ok) {
        setOrderData(data);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (error) {
      setError('Unable to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '🕐';
      case 'confirmed': return '✅';
      case 'processing': return '⚙️';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 20;
      case 'confirmed': return 40;
      case 'processing': return 60;
      case 'shipped': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-playfair font-bold text-navy mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order number below to track the status and delivery progress of your Higi Fashion House order.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., HFH-123456-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                You can find your order number in your confirmation email
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-gold to-gold/80 text-white font-semibold py-3 px-6 rounded-lg hover:from-gold/90 hover:to-gold/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Tracking...</span>
                </div>
              ) : (
                'Track Order'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Order Results */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-navy">
                    Order #{orderData.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    Placed on {new Date(orderData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
                  {getStatusIcon(orderData.status)} {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Order Progress</span>
                  <span>{getProgressPercentage(orderData.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(orderData.status)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-gold to-gold/80 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                  const isActive = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
                    .indexOf(orderData.status) >= index;
                  return (
                    <div key={status} className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm ${
                        isActive ? 'bg-gold text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {getStatusIcon(status)}
                      </div>
                      <p className={`text-xs font-medium ${
                        isActive ? 'text-gold' : 'text-gray-400'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Tracking Information */}
                <div>
                  <h3 className="font-semibold text-navy mb-3">Tracking Information</h3>
                  <div className="space-y-2 text-sm">
                    {orderData.trackingNumber && (
                      <p>
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-medium ml-2">{orderData.trackingNumber}</span>
                      </p>
                    )}
                    {orderData.estimatedDelivery && (
                      <p>
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span className="font-medium ml-2">
                          {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium ml-2">
                        {new Date().toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-navy mb-3">Need Help?</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Email:</span>
                      <a href="mailto:orders@higifashionhouse.com" className="text-gold hover:underline ml-2">
                        orders@higifashionhouse.com
                      </a>
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>
                      <a href="tel:+254XXXXXXXXx" className="text-gold hover:underline ml-2">
                        +254 XXX XXX XXX
                      </a>
                    </p>
                    <p>
                      <span className="text-gray-600">WhatsApp:</span>
                      <a href="https://wa.me/254XXXXXXXXX" className="text-gold hover:underline ml-2">
                        Chat with us
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👕</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {orderData.statusHistory && orderData.statusHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-navy mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {orderData.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gold rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(history.timestamp).toLocaleString()}
                          </p>
                          {history.notes && (
                            <p className="text-xs text-gray-500 mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Can't find your order or need additional assistance?
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors inline-block"
            >
              Contact Support
            </a>
            <a
              href="/account"
              className="border border-gold text-gold px-6 py-2 rounded-lg hover:bg-gold hover:text-white transition-colors inline-block"
            >
              View Account
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking; 