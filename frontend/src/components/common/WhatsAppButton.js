import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTimes, FaComment } from 'react-icons/fa';

const WhatsAppButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');

  const whatsappNumber = "254793896899";
  
  const quickMessages = [
    {
      id: 1,
      text: "Hi Higi Fashion House, I am interested in a custom tailored outfit.",
      label: "Custom Tailoring"
    },
    {
      id: 2,
      text: "Hello! I'd like to inquire about your products and pricing.",
      label: "Product Inquiry"
    },
    {
      id: 3,
      text: "Hi, I need help with my order status.",
      label: "Order Status"
    },
    {
      id: 4,
      text: "Hello! I'm interested in bulk orders for an event.",
      label: "Bulk Orders"
    },
    {
      id: 5,
      text: "Hi, I'd like to schedule a fitting appointment.",
      label: "Fitting Appointment"
    },
    {
      id: 6,
      text: "Hello! I have a question about African fashion and styling.",
      label: "Fashion Consultation"
    }
  ];

  const handleWhatsAppClick = (message = selectedMessage) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsExpanded(false);
  };

  const handleQuickMessage = (message) => {
    setSelectedMessage(message);
    handleWhatsAppClick(message);
  };

  return (
    <>
      {/* Main WhatsApp Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaTimes className="text-2xl" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaWhatsapp className="text-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* Pulsing Ring Animation */}
        {!isExpanded && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Expanded Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            style={{ width: '320px', maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <FaWhatsapp className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat with Higi Fashion House</h3>
                  <p className="text-sm opacity-90">We're here to help!</p>
                </div>
              </div>
            </div>

            {/* Quick Messages */}
            <div className="p-4 max-h-80 overflow-y-auto">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <FaComment className="mr-2" />
                Quick Messages
              </h4>
              <div className="space-y-2">
                {quickMessages.map((msg) => (
                  <motion.button
                    key={msg.id}
                    onClick={() => handleQuickMessage(msg.text)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-green-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium text-sm text-gray-800 mb-1">
                      {msg.label}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {msg.text}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="border-t border-gray-200 p-4">
              <textarea
                value={selectedMessage}
                onChange={(e) => setSelectedMessage(e.target.value)}
                placeholder="Type your custom message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
              <motion.button
                onClick={() => handleWhatsAppClick()}
                disabled={!selectedMessage.trim()}
                className="w-full mt-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: selectedMessage.trim() ? 1.02 : 1 }}
                whileTap={{ scale: selectedMessage.trim() ? 0.98 : 1 }}
              >
                <FaWhatsapp />
                <span>Send Message</span>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">
                Available Mon-Sat, 9:00am-6:00pm
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black bg-opacity-20 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppButton; 