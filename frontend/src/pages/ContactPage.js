import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      title: "Phone",
      icon: PhoneIcon,
      details: [
        { label: "Main Line", value: "+254 711 234 567" },
        { label: "WhatsApp", value: "+254 722 345 678" },
        { label: "Customer Service", value: "+254 733 456 789" }
      ]
    },
    {
      title: "Email",
      icon: EnvelopeIcon,
      details: [
        { label: "General Inquiries", value: "info@higifashion.co.ke" },
        { label: "Orders & Support", value: "orders@higifashion.co.ke" },
        { label: "Custom Tailoring", value: "custom@higifashion.co.ke" },
        { label: "Ambassador Program", value: "ambassador@higifashion.co.ke" }
      ]
    },
    {
      title: "Location",
      icon: MapPinIcon,
      details: [
        { label: "Studio Location", value: "Wangige Market, Kiambu County, Kenya" }
      ]
    },
    {
      title: "Business Hours",
      icon: ClockIcon,
      details: [
        { label: "Monday - Friday", value: "9:00 AM - 7:00 PM" },
        { label: "Saturday", value: "9:00 AM - 6:00 PM" },
        { label: "Sunday", value: "10:00 AM - 4:00 PM" },
        { label: "Public Holidays", value: "Closed" }
      ]
    }
  ];

  const socialMedia = [
    { name: "Instagram", handle: "@higifashionhouse", followers: "25.3K" },
    { name: "Facebook", handle: "Higi Fashion House", followers: "18.7K" },
    { name: "Twitter", handle: "@higifashion", followers: "12.1K" },
    { name: "TikTok", handle: "@higifashionke", followers: "8.9K" }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Map frontend inquiryType to backend serviceType
  const mapInquiryTypeToServiceType = (inquiryType) => {
    const mapping = {
      'general': 'general',
      'order': 'delivery',
      'custom': 'tailoring', 
      'ambassador': 'partnership',
      'wholesale': 'partnership',
      'complaint': 'other'
    };
    return mapping[inquiryType] || 'general';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          serviceType: mapInquiryTypeToServiceType(formData.inquiryType)
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Message sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gold-600 to-orange-600 text-white py-16">
        <div className="container-width section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Get In Touch
            </h1>
            <p className="text-xl text-gold-100 max-w-2xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container-width section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gold-100 p-3 rounded-lg">
                    <info.icon className="h-6 w-6 text-gold-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-3">
                    {info.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {info.details.map((detail, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-medium text-gray-600">
                        {detail.label}
                      </p>
                      <p className="text-gray-900 font-medium">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="+254 xxx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="custom">Custom Tailoring</option>
                    <option value="ambassador">Ambassador Program</option>
                    <option value="wholesale">Wholesale/Business</option>
                    <option value="complaint">Complaint/Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Brief subject of your message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Map Placeholder */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Visit Our Studio
                </h3>
                <div className="bg-gray-200 rounded-lg h-64 overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7234567890123!2d36.7073!3d-1.2023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTInMDguMyJTIDM2wrA0MicyNi4zIkU!5e0!3m2!1sen!2ske!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Higi Fashion House Location - Wangige Market"
                  ></iframe>
                </div>
                <div className="mt-4 p-4 bg-gold-50 rounded-lg">
                  <p className="text-sm text-gold-800">
                    <strong>Directions:</strong> Located in Wangige Market, Kiambu County. Easily accessible by public transport and car. Free parking available for customers.
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialMedia.map((social, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gold-50 transition-colors cursor-pointer">
                      <h4 className="font-semibold text-gray-900">{social.name}</h4>
                      <p className="text-sm text-gray-600">{social.handle}</p>
                      <p className="text-xs text-gold-600 font-medium">{social.followers} followers</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Contact Options */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Contact
                </h3>
                <div className="space-y-3">
                  <a
                    href="tel:+254711234567"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <PhoneIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-green-800 font-medium">Call Now</span>
                  </a>
                  <a
                    href="https://wa.me/254722345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-green-800 font-medium">WhatsApp Chat</span>
                  </a>
                  <a
                    href="mailto:info@higifashion.co.ke"
                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-800 font-medium">Send Email</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-100">
        <div className="container-width section-padding">
          <h2 className="text-3xl font-display font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Do you offer custom tailoring services?",
                answer: "Yes! We provide bespoke tailoring services for all our African wear collections. Contact us for measurements and design consultations."
              },
              {
                question: "What are your delivery options?",
                answer: "We offer same-day delivery within Nairobi, next-day delivery to major cities, and nationwide shipping within 3-7 days."
              },
              {
                question: "Can I return or exchange items?",
                answer: "Yes, we have a 14-day return/exchange policy for unworn items with original tags. Custom-made items are non-returnable."
              },
              {
                question: "Do you have a physical store?",
                answer: "Yes! Visit our studio at Wangige Market, Kiambu County, Kenya. See our business hours above."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 