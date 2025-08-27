import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CheckCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // will switch to 2 automatically when user data loaded

  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Kenya'
  });

  // Prefill customer info from profile and skip to payment step
  useEffect(() => {
    if (user && user.firstName) {
      setCustomerInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.billingInfo?.estate || '',
        city: user.billingInfo?.city || '',
        postalCode: '',
        country: 'Kenya',
      });
      setStep(2); // Skip shipping info
    }
  }, [user]);

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'mpesa', // mpesa, card, cod
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    mpesaNumber: ''
  });

  const [shippingOption, setShippingOption] = useState('standard');

  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '3-5 business days',
      price: 500,
      icon: TruckIcon
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '1-2 business days',
      price: 1000,
      icon: TruckIcon
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      description: 'Within Nairobi only',
      price: 1500,
      icon: TruckIcon
    }
  ];

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay with M-Pesa mobile money',
      icon: '📱'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard accepted',
      icon: '💳'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: '💵'
    }
  ];

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getShippingCost = () => {
    const option = shippingOptions.find(opt => opt.id === shippingOption);
    return option ? option.price : 0;
  };

  const getFinalTotal = () => {
    return total + getShippingCost();
  };

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentInfoChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => true; // shipping info auto-filled

  const validateStep2 = () => {
    if (paymentInfo.method === 'mpesa') {
      return paymentInfo.mpesaNumber.trim() !== '';
    }
    if (paymentInfo.method === 'card') {
      return paymentInfo.cardNumber.trim() !== '' && 
             paymentInfo.expiryDate.trim() !== '' && 
             paymentInfo.cvv.trim() !== '';
    }
    return true; // COD doesn't need validation
  };

  const handleContinueToPayment = () => {
    if (!validateStep1()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep2()) {
      toast.error('Please complete payment information');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Cart items before transformation:', JSON.stringify(items, null, 2));
      
      // Transform cart items to backend format
      const backendItems = items.map(cartItem => {
        console.log('Processing cart item:', cartItem);
        
        // Handle different cart item structures
        let productId, productName, productPrice;
        
        if (cartItem.product && cartItem.product._id) {
          // Standard structure: cartItem.product._id
          productId = cartItem.product._id;
          productName = cartItem.product.name;
          productPrice = cartItem.product.price;
        } else if (cartItem.product && cartItem.product.id) {
          // Structure with product.id
          productId = cartItem.product.id;
          productName = cartItem.product.name;
          productPrice = cartItem.product.price;
        } else if (cartItem._id) {
          // Direct structure: cartItem._id
          productId = cartItem._id;
          productName = cartItem.name;
          productPrice = cartItem.price;
        } else if (cartItem.id) {
          // Direct structure: cartItem.id
          productId = cartItem.id;
          productName = cartItem.name;
          productPrice = cartItem.price;
        } else {
          throw new Error(`Invalid cart item structure: ${JSON.stringify(cartItem)}`);
        }
        
        return {
          product: productId,
          nameSnapshot: productName,
          priceSnapshot: productPrice,
          qty: cartItem.quantity,
          size: cartItem.size || '',
          color: cartItem.color || '',
        };
      });

      console.log('Backend items after transformation:', JSON.stringify(backendItems, null, 2));

      const payload = {
        items: backendItems,
        paymentMethod: paymentInfo.method,
        paymentDetails: {
          phone: paymentInfo.mpesaNumber
        }
      };

      console.log('Checkout payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post('/api/checkout', payload);

      if (response.data.paymentStatus === 'pending') {
        // M-Pesa payment initiated - show pending status
        toast.success('M-Pesa payment initiated! Please check your phone for STK Push.');
        
        // Navigate to payment pending page
        navigate(`/payment-pending/${response.data.order._id}`, {
          state: { 
            order: response.data.order,
            checkoutRequestId: response.data.checkoutRequestId
          }
        });
      } else {
        // Other payment methods
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${response.data.order._id}`, {
          state: { order: response.data.order }
        });
      }
    } catch (error) {
      console.error('Checkout error', error);
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to proceed with checkout.</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {[
              { number: 1, title: 'Shipping Information', current: step === 1, completed: step > 1 },
              { number: 2, title: 'Payment Details', current: step === 2, completed: step > 2 },
              { number: 3, title: 'Order Confirmation', current: step === 3, completed: false }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm ${
                  stepItem.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : stepItem.current
                    ? 'bg-gold-500 border-gold-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {stepItem.completed ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  stepItem.current ? 'text-gold-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    stepItem.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping form disabled – step 1 skipped */}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <CreditCardIcon className="h-6 w-6 mr-3 text-gold-500" />
                    Payment Details
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-gold-600 hover:text-gold-700 font-medium"
                  >
                    ← Back to Shipping
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentInfo.method === method.id
                            ? 'border-gold-500 bg-gold-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentInfo.method === method.id}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, method: e.target.value })}
                          className="sr-only"
                        />
                        <div className="text-3xl mb-2">{method.icon}</div>
                        <h4 className="font-semibold text-gray-900 text-center">{method.name}</h4>
                        <p className="text-sm text-gray-600 text-center">{method.description}</p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Form */}
                {paymentInfo.method === 'mpesa' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="mpesaNumber"
                      value={paymentInfo.mpesaNumber}
                      onChange={handlePaymentInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="+254 xxx xxx xxx"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      You will receive a prompt on your phone to complete the payment
                    </p>
                  </div>
                )}

                {paymentInfo.method === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentInfoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentInfoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentInfoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="123"
                      />
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'cod' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>Cash on Delivery:</strong> You will pay when your order is delivered. 
                      Please have the exact amount ready.
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-32">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{item.product.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                      </p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">{formatPrice(getShippingCost())}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gold-600">{formatPrice(getFinalTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gold-50 rounded-lg">
                <div className="flex items-center text-gold-800">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 