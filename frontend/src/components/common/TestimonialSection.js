import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials/featured');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials || []);
        } else {
          // Use fallback testimonials if API fails
          setTestimonials(getFallbackTestimonials());
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials(getFallbackTestimonials());
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change testimonial every 5 seconds

      return () => clearInterval(interval);
    }
  }, [testimonials]);

  const getFallbackTestimonials = () => [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Absolutely Stunning Quality!",
      content: "I bought the elegant evening gown for my daughter's wedding and it was absolutely perfect. The quality exceeded my expectations and I received so many compliments. Higi Fashion House truly understands luxury fashion.",
      rating: 5,
      location: "Nairobi, Kenya",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Grace Kimani",
      title: "Perfect Fit and Beautiful Design",
      content: "The bridal gown I ordered was exactly what I dreamed of. The attention to detail is incredible and the customer service was exceptional. Thank you for making my special day even more beautiful!",
      rating: 5,
      location: "Mombasa, Kenya",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Mary Wanjiku",
      title: "Love the Casual Collection",
      content: "The cotton dress I bought is so comfortable and stylish. Perfect for everyday wear and the quality is amazing for the price. Will definitely be ordering more!",
      rating: 5,
      location: "Kisumu, Kenya",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Alice Muthoni",
      title: "Great Professional Wear",
      content: "The blazer fits perfectly and looks very professional. Good quality fabric and excellent tailoring. Slight delay in delivery but worth the wait.",
      rating: 4,
      location: "Nakuru, Kenya",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Linda Akinyi",
      title: "Beautiful Accessories",
      content: "The gold necklace is gorgeous and adds the perfect touch to any outfit. Fast shipping and secure packaging. Highly recommend Higi Fashion House!",
      rating: 5,
      location: "Eldoret, Kenya",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-navy rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-navy mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their 
            experience with Higi Fashion House.
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 md:p-12 mx-auto max-w-4xl"
            >
              <div className="text-center">
                {/* Quote Icon */}
                <div className="mb-6">
                  <svg className="w-12 h-12 text-gold mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-semibold text-navy mb-4">
                  {testimonials[currentIndex].title}
                </h3>

                {/* Content */}
                <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
                  "{testimonials[currentIndex].content}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center justify-center">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gold"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-navy text-lg">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-gray-600">
                      {testimonials[currentIndex].location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-white shadow-lg rounded-full p-3 text-gray-600 hover:text-gold hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 md:translate-x-6 bg-white shadow-lg rounded-full p-3 text-gray-600 hover:text-gold hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-gold transform scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* All Testimonials Grid (Mobile) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:hidden">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <h4 className="font-semibold text-navy mb-2">{testimonial.title}</h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers who trust Higi Fashion House
          </p>
          <button className="bg-gold text-white px-8 py-3 rounded-lg hover:bg-gold/90 transition-colors font-medium">
            Shop Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection; 