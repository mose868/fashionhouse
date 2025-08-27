import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderNumber) {
      const fetchOrderDetails = async () => {
        try {
          const response = await fetch(`/api/orders/track/${orderNumber}`);
          const data = await response.json();
          if (response.ok) {
            setOrderData(data);
          } else {
            setError('Order not found');
          }
        } catch (error) {
          setError('Unable to load order details');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-navy mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/shop"
            className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-playfair font-bold text-navy mb-4"
          >
            Order Confirmed!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Thank you for your order! We've received your purchase and will begin processing it shortly.
            A confirmation email has been sent to your email address.
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          {/* Order Header */}
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-navy mb-1">Order Number</h3>
                <p className="text-xl font-bold text-gold">{orderData?.orderNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-1">Order Date</h3>
                <p className="text-gray-600">
                  {orderData?.createdAt && new Date(orderData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-1">Status</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {orderData?.status?.charAt(0).toUpperCase() + orderData?.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="font-semibold text-navy mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderData?.items?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👕</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-navy">{item.name}</h4>
                    <div className="text-sm text-gray-600 space-x-4 mt-1">
                      <span>Quantity: {item.quantity}</span>
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy">KES {item.price * item.quantity}</p>
                    <p className="text-sm text-gray-600">KES {item.price} each</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Order Summary & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-navy mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KES {orderData?.itemsPrice || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {orderData?.shippingPrice === 0 ? 'Free' : `KES ${orderData?.shippingPrice || 0}`}
                </span>
              </div>
              {orderData?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-KES {orderData.discount}</span>
                </div>
              )}
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold text-navy">
                <span>Total</span>
                <span className="text-gold">KES {orderData?.totalAmount || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-navy mb-4">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-navy">Order Processing</h4>
                  <p className="text-sm text-gray-600">We'll prepare your items for shipment within 1-2 business days.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-navy">Shipping</h4>
                  <p className="text-sm text-gray-600">Your order will be shipped and you'll receive a tracking number.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-navy">Delivery</h4>
                  <p className="text-sm text-gray-600">Your fashion pieces will arrive at your doorstep in 3-7 business days.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/track-order?order=${orderData?.orderNumber}`}
              className="bg-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
            >
              Track Your Order
            </Link>
            <Link
              to="/shop"
              className="border-2 border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
          
          <p className="text-sm text-gray-600 mt-6">
            Questions about your order? 
            <Link to="/contact" className="text-gold hover:underline ml-1">
              Contact our support team
            </Link>
          </p>
        </motion.div>

        {/* Social Sharing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-600 mb-4">Share your Higi Fashion experience!</p>
          <div className="flex justify-center space-x-4">
            <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <span className="sr-only">Share on Facebook</span>
              📘
            </button>
            <button className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
              <span className="sr-only">Share on Instagram</span>
              📷
            </button>
            <button className="p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
              <span className="sr-only">Share on Twitter</span>
              🐦
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 