import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-gold/10 flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Elegant 404 */}
          <h1 className="text-9xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold/80 to-gold/60 mb-4">
            404
          </h1>
          
          {/* Fashion-themed icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-6xl mb-6"
          >
            👗
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-playfair font-bold text-navy mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto mb-2">
            It seems like this page has gone out of style. The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, our fashion collection is still here waiting for you!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4 mb-12"
        >
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-gradient-to-r from-gold to-gold/80 text-white px-8 py-3 rounded-lg font-semibold hover:from-gold/90 hover:to-gold/70 transition-all duration-300 transform hover:scale-105"
            >
              Go Home
            </Link>
            <Link
              to="/shop"
              className="border-2 border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Shop Collection
            </Link>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="border-t border-gray-200 pt-8"
        >
          <p className="text-gray-600 mb-4">Or explore these popular sections:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/collections"
              className="text-gold hover:underline transition-colors"
            >
              Collections
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/about"
              className="text-gold hover:underline transition-colors"
            >
              About Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/contact"
              className="text-gold hover:underline transition-colors"
            >
              Contact
            </Link>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          {/* Floating fashion icons */}
          <div className="absolute top-20 left-10 text-gold/20 text-4xl animate-bounce">
            👠
          </div>
          <div className="absolute top-40 right-20 text-gold/20 text-3xl animate-pulse">
            👜
          </div>
          <div className="absolute bottom-32 left-20 text-gold/20 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>
            💍
          </div>
          <div className="absolute bottom-20 right-10 text-gold/20 text-3xl animate-pulse" style={{ animationDelay: '2s' }}>
            🌟
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 