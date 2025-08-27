import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const footerLinks = {
    shop: [
      { name: 'New Arrivals', href: '/shop?sort=newest' },
      { name: 'All Products', href: '/shop' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Location', href: '/location' },
    ],
    support: [
      { name: 'Track Order', href: '/track-order' },
      { name: 'Customer Account', href: '/account' },
      { name: 'Ambassador Program', href: '/ambassador' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/higifashion', icon: '📷' },
    { name: 'Facebook', href: 'https://facebook.com/higifashion', icon: '📘' },
    { name: 'Twitter', href: 'https://twitter.com/higifashion', icon: '🐦' },
    { name: 'WhatsApp', href: 'https://wa.me/254700000000', icon: '💬' },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'footer'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setNewsletterEmail('');
      } else {
        toast.error(result.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container-width section-padding py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-display font-bold mb-4">
              Stay in Style
            </h3>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter for exclusive access to new collections, 
              fashion tips, and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-none focus:outline-none focus:ring-2 focus:ring-gold-500 text-white placeholder-gray-400"
                required
              />
              <motion.button
                type="submit"
                disabled={isSubscribing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-width section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <div className="text-3xl font-display font-bold">
                HIGI
                <span className="text-gold-500 ml-1">FASHION</span>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Redefining African luxury through contemporary fashion. 
              We create timeless pieces that celebrate elegance, quality, and cultural heritage.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg hover:bg-gold-500 transition-colors duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-gold-500 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-gold-500 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-gold-500 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container-width section-padding py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Higi Fashion House. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link to="/contact" className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
                Contact Us
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 