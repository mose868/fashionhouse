import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { 
    items, 
    total, 
    itemCount, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const subtotal = total;
  const shipping = subtotal > 10000 ? 0 : 500; // Free shipping over KES 10,000
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet. 
              Discover our beautiful African fashion collection!
            </p>
            <div className="space-y-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Continue Shopping
              </Link>
              <br />
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 transition-colors"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
            >
              <TrashIcon className="h-5 w-5" />
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-6 border-b border-gray-100 last:border-b-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {item.size && (
                              <span>Size: <span className="font-medium">{item.size}</span></span>
                            )}
                            {item.color && (
                              <span>Color: <span className="font-medium">{item.color}</span></span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(item.product.price)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 transition-colors font-medium"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-gold-600 text-white py-4 px-6 rounded-lg font-semibold text-center hover:bg-gold-700 transition-colors block mb-4"
              >
                Proceed to Checkout
              </Link>

              {/* Features */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <TruckIcon className="h-5 w-5 text-green-600" />
                  <span>
                    {shipping === 0 ? 'Free shipping included' : 'Free shipping on orders over KES 10,000'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <TagIcon className="h-5 w-5 text-purple-600" />
                  <span>14-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;