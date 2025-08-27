import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaTimes, 
  FaPaperPlane, 
  FaSpinner,
  FaUser,
  FaMagic,
  FaShoppingBag,
  FaPalette,
  FaRuler
} from 'react-icons/fa';
import axios from 'axios';

const AIFashionAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm Amara, your African fashion stylist. How can I help you today? 👗✨",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    {
      icon: <FaShoppingBag className="text-purple-600" />,
      text: "Help me find the perfect outfit",
      action: "Help me find an African outfit"
    },
    {
      icon: <FaPalette className="text-pink-600" />,
      text: "Color and pattern advice",
      action: "What colors and patterns suit me?"
    },
    {
      icon: <FaRuler className="text-blue-600" />,
      text: "Size and fit guidance",
      action: "What size should I order?"
    },
    {
      icon: <FaMagic className="text-orange-600" />,
      text: "Custom tailoring info",
      action: "Tell me about custom tailoring"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      // Ensure axios has base URL
      if (!axios.defaults.baseURL) {
        axios.defaults.baseURL = 'http://localhost:5010';
      }

      const response = await axios.post('/api/ai/chat', {
        message: message,
        context: {
          user_preferences: {},
          conversation_history: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI Chat Error:', error.response?.data || error.message);
      let errorContent = "I apologize, but I'm having trouble connecting right now.";
      
      if (error.code === 'ERR_NETWORK') {
        errorContent = "Cannot connect to the server. Please make sure the backend server is running on port 5010.";
      } else if (error.response?.status === 404) {
        errorContent = "Chat service not found. Please check if the backend is properly configured.";
      } else if (error.response?.status === 500) {
        errorContent = error.response?.data?.error || "Server error. Please try again later.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hi! I'm Amara. What African fashion are you looking for? 👗",
        timestamp: new Date()
      }
    ]);
    setShowQuickActions(true);
  };

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
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
                key="ai"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <FaRobot className="text-2xl" />
                {/* AI Pulse Animation */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Floating Label */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            <div className="text-sm font-medium">AI Fashion Stylist</div>
            <div className="text-xs opacity-75">Ask Amara for style advice</div>
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
          </motion.div>
        )}
      </motion.div>

      {/* AI Assistant Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-6 z-40 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
            style={{ width: '380px', height: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FaRobot className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Amara AI Stylist</h3>
                    <p className="text-sm opacity-90">Your African Fashion Expert</p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Clear chat"
                >
                  <FaMagic className="text-sm" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : message.isError
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    <div className={`flex items-end ${message.type === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-purple-100' 
                          : 'bg-gradient-to-r from-purple-100 to-pink-100'
                      }`}>
                        {message.type === 'user' ? (
                          <FaUser className="text-purple-600 text-sm" />
                        ) : (
                          <FaRobot className="text-purple-600 text-sm" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                      <FaRobot className="text-purple-600 text-sm" />
                      <FaSpinner className="animate-spin text-purple-600 text-sm" />
                      <span className="text-sm text-gray-600">Amara is thinking...</span>
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions */}
                {showQuickActions && messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-sm text-gray-600 font-medium">Quick questions:</p>
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleQuickAction(action.action)}
                        className="w-full text-left p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors duration-200 border border-purple-200 hover:border-purple-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">{action.icon}</div>
                          <span className="text-sm font-medium text-gray-700">{action.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
                    placeholder="Ask Amara about African fashion..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isTyping}
                  />
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    whileHover={{ scale: inputMessage.trim() && !isTyping ? 1.05 : 1 }}
                    whileTap={{ scale: inputMessage.trim() && !isTyping ? 0.95 : 1 }}
                  >
                    {isTyping ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <FaPaperPlane className="text-sm" />
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by Google Gemini AI • African Fashion Expert
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-20 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFashionAssistant; 