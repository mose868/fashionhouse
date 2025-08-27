import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaPhone, FaMapMarkerAlt, FaDirections, FaWhatsapp } from 'react-icons/fa';
import { SparklesIcon } from '@heroicons/react/24/outline';

const LocationPage = () => {
  const studioInfo = {
    name: "Higi Fashion House Tailoring Studio",
    address: "Wangige Market, Kiambu County, Kenya",
    phone: "+254 793 896 899",
    hours: {
      weekdays: "Monday - Friday: 9:00am - 6:00pm",
      saturday: "Saturday: 9:00am - 6:00pm",
      sunday: "Sunday: Closed"
    },
    coordinates: {
      lat: -1.2023,
      lng: 36.7073
    }
  };



  const handleDirections = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(studioInfo.address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleWhatsApp = () => {
    const message = "Hello! I'd like to schedule a visit to your studio.";
    const whatsappUrl = `https://wa.me/254793896899?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Visit Our Tailoring Studio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Experience the art of African fashion in our beautiful studio located in the heart of Wangige Market
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Studio Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Studio Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <FaMapMarkerAlt className="text-red-500 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">{studioInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FaPhone className="text-green-500 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <a
                      href={`tel:${studioInfo.phone}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {studioInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FaClock className="text-blue-500 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Opening Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>{studioInfo.hours.weekdays}</p>
                      <p>{studioInfo.hours.saturday}</p>
                      <p className="text-red-600">{studioInfo.hours.sunday}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={handleDirections}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaDirections />
                  <span>Get Directions</span>
                </motion.button>
                
                <motion.button
                  onClick={handleWhatsApp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <FaWhatsapp />
                  <span>Chat with Us</span>
                </motion.button>
              </div>
            </div>

            {/* AI Consultant CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Try Our AI Consultant</h2>
              <p className="text-purple-100 mb-6">
                Get personalized fashion advice, style recommendations, and virtual try-on experiences with our advanced AI technology.
              </p>
              <Link
                to="/ai-consultant"
                className="inline-flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Try AI Consultant</span>
              </Link>
            </div>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Google Maps Embed */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 bg-gray-200 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7234567890123!2d36.7073!3d-1.2023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTInMDguMyJTIDM2wrA0MicyNi4zIkU!5e0!3m2!1sen!2ske!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Higi Fashion House Location"
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Us at Wangige Market</h3>
                <p className="text-gray-600 mb-4">
                  We're located in the vibrant Wangige Market, known for its rich cultural heritage and artisan crafts. 
                  Look for our distinctive sign with traditional African patterns.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📍 Ground Floor, Section B</span>
                  <span>🚗 Parking Available</span>
                </div>
              </div>
            </div>

            {/* Getting Here */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Here</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🚗 By Car</h3>
                  <p className="text-gray-600 text-sm">
                    Free parking available at Wangige Market. Enter through the main gate and follow signs to Section B.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🚌 By Public Transport</h3>
                  <p className="text-gray-600 text-sm">
                    Take a matatu to Wangige stage. Our studio is a 2-minute walk from the main stage.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🏪 Landmarks</h3>
                  <p className="text-gray-600 text-sm">
                    Near Wangige Primary School and opposite the main market entrance. Look for the blue and gold 
                    Higi Fashion House sign.
                  </p>
                </div>
              </div>
            </div>

            {/* Visit Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Visit Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Book an appointment via WhatsApp for guaranteed attention</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Bring reference images or inspiration photos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Allow 30-45 minutes for consultation and measurements</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Ask about our fabric selection and customization options</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-gold-400 to-gold-600 py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Perfect Outfit?
          </h2>
          <p className="text-xl text-gold-100 mb-8 max-w-2xl mx-auto">
            Visit our studio for a personalized consultation and experience the finest African fashion craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={handleWhatsApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gold-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Schedule a Visit
            </motion.button>
            <motion.button
              onClick={handleDirections}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-gold-600 transition-colors"
            >
              Get Directions
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LocationPage; 