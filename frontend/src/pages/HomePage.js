import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  SparklesIcon, 
  ShoppingBagIcon, 
  ChevronDownIcon,
  ArrowRightIcon,
  GiftIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  TagIcon,
  EyeIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
  FireIcon as FireSolidIcon 
} from '@heroicons/react/24/solid';
import TestimonialSection from '../components/common/TestimonialSection';
// InstagramFeed removed

const HomePage = () => {
  const [activeCollection, setActiveCollection] = useState(0);
  const [collections, setCollections] = useState([]);
  const [isVisible, setIsVisible] = useState({});

  // Fetch featured products for hero carousel
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get('/api/products?limit=5&featured=true');
        if (data.success) {
          const mapped = data.products.map((p) => ({
            id: p._id,
            title: p.name,
            subtitle: p.category || '',
            description: p.shortDescription || p.description?.substring(0, 120) + '...',
            image: (typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url) || '',
            icon: '⭐',
            items: '',
            price: `KES ${p.price?.toLocaleString()}`
          }));
          if (mapped.length) setCollections(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch featured products', err);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: TruckIcon,
      title: "Free Delivery",
      description: "Same-day delivery in Nairobi",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: ShieldCheckIcon,
      title: "Authentic Quality",
      description: "100% genuine African fabrics",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: ClockIcon,
      title: "Quick Tailoring",
      description: "Custom fit in 48 hours",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: CurrencyDollarIcon,
      title: "Best Prices",
      description: "Unbeatable value for money",
      color: "text-gold-600",
      bgColor: "bg-gold-100"
    }
  ];

  const stats = [
    { icon: UsersIcon, number: "5,000+", label: "Happy Customers", color: "text-blue-500" },
    { icon: TagIcon, number: "300+", label: "Unique Designs", color: "text-green-500" },
    { icon: StarSolidIcon, number: "4.9★", label: "Customer Rating", color: "text-yellow-500" },
    { icon: GlobeAltIcon, number: "25+", label: "Countries Served", color: "text-purple-500" }
  ];

  // Auto-rotate collections
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCollection((prev) => (prev + 1) % collections.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [collections.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const currentCollection = collections[activeCollection] || {};

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Enhanced Hero Section */}
      {collections.length > 0 && (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with multiple layers */}
        <div className="absolute inset-0">
          {/* Video/Image Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1920&h=1080&fit=crop')`
            }}
          ></div>
          
          {/* Enhanced overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60"></div>
        </div>

        {/* Animated particles/decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-100, -200],
                x: [0, Math.random() * 100 - 50]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%'
              }}
            >
              <SparklesIcon className="h-6 w-6 text-gold-400" />
            </motion.div>
          ))}
        </div>
        
        {/* Hero Content */}
        <div className="relative z-20 text-center text-white px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-3 mb-8 bg-white/15 backdrop-blur-md border border-white/30 px-8 py-4 rounded-full"
            >
              <FireSolidIcon className="h-6 w-6 text-orange-400" />
              <span className="text-white font-bold tracking-wider uppercase text-sm">
                Premium African Fashion
              </span>
              <FireSolidIcon className="h-6 w-6 text-orange-400" />
            </motion.div>
            
            {/* Main Heading with Better Visibility */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black mb-8 leading-tight"
            >
              <span className="block text-white drop-shadow-2xl filter">
                Authentic
              </span>
              <span className="block bg-gradient-to-r from-gold-300 via-gold-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl filter">
                African
              </span>
              <span className="block text-white drop-shadow-2xl filter">
                Elegance
              </span>
            </motion.h1>
          </motion.div>
          
          {/* Enhanced Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mb-12"
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto leading-relaxed font-medium bg-black/30 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-2xl">
              Discover timeless elegance with our exclusive collection of 
              <span className="text-gold-300 font-bold"> contemporary African fashion </span>
              that celebrates heritage while embracing modern sophistication
            </p>
          </motion.div>
          
          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/shop" 
                className="group relative bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 text-white px-12 py-6 rounded-full font-bold text-lg shadow-2xl hover:shadow-gold-500/50 transition-all duration-300 flex items-center gap-3 border-2 border-gold-400/50"
              >
                <ShoppingBagIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Explore Collections</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/ambassador" 
                className="group flex items-center gap-3 bg-white/15 backdrop-blur-md border-2 border-white/40 text-white px-12 py-6 rounded-full font-bold text-lg hover:bg-white/25 hover:border-white/60 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <StarSolidIcon className="h-6 w-6 text-gold-400 group-hover:scale-110 transition-transform" />
                <span>Join Ambassador Program</span>
                <GiftIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats with Icons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center hover:bg-black/50 transition-all duration-300 group"
              >
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                <div className="text-3xl sm:text-4xl font-black text-white mb-2 drop-shadow-lg">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-200 font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white z-20"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-gray-200 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              Scroll to explore amazing collections
            </span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-12 border-2 border-gold-400/80 rounded-full flex justify-center bg-black/20 backdrop-blur-sm shadow-lg"
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-4 bg-gold-400 rounded-full mt-2"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>
      )}

      {/* Features Section */}
      <section 
        id="features" 
        data-animate
        className="py-20 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible.features ? 1 : 0, y: isVisible.features ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gold-100 px-6 py-3 rounded-full mb-6">
              <CheckBadgeIcon className="h-6 w-6 text-gold-600" />
              <span className="text-gold-800 font-bold text-sm uppercase tracking-wider">
                Why Choose Higi Fashion
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              Premium African Fashion Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference of authentic African fashion with modern quality standards and exceptional service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: isVisible.features ? 1 : 0, 
                  y: isVisible.features ? 0 : 50 
                }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Collections Showcase */}
      <section 
        id="collections" 
        data-animate
        className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible.collections ? 1 : 0, y: isVisible.collections ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-gold-400/30">
              <EyeIcon className="h-6 w-6 text-gold-400" />
              <span className="text-gold-300 font-bold text-sm uppercase tracking-wider">
                Featured Collections
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Curated African Masterpieces
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Each collection tells a story of African heritage, modern craftsmanship, and timeless elegance
            </p>
          </motion.div>

          {/* Collection Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {collections.map((collection, index) => (
              <motion.button
                key={collection.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCollection(index)}
                className={`px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-3 ${
                  activeCollection === index
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                <span className="text-2xl">{collection.icon || '⭐'}</span>
                <span>{collection.title || ''}</span>
                {activeCollection === index && (
                  <ChevronDownIcon className="h-5 w-5 animate-bounce" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Active Collection Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCollection}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="text-white">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="text-6xl mb-6">{collections[activeCollection]?.icon || '⭐'}</div>
                  <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
                    {currentCollection.title || ''}
                  </h3>
                  <p className="text-xl text-gold-400 font-semibold mb-6">
                    {currentCollection.subtitle || ''}
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed mb-8">
                    {currentCollection.description || ''}
                  </p>
                  
                  <div className="flex flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                      <TagIcon className="h-5 w-5 text-gold-400" />
                      <span className="font-semibold">{currentCollection.items || ''}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                      <span className="font-semibold">{currentCollection.price || ''}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/shop"
                      className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                      Shop Collection
                    </Link>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-white/30">
                      <EyeIcon className="h-5 w-5" />
                      View Details
                    </button>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                  {collections.length > 0 && (
                  <img
                    src={currentCollection.image || ''}
                    alt={currentCollection.title || ''}
                    className="w-full h-96 lg:h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <HandThumbUpIcon className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-gray-900">4.9★</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 bg-gold-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="font-bold text-white">Trending Now</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Ambassador Program CTA */}
      <section 
        id="ambassador" 
        data-animate
        className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583488905169-7ad7b31c5b14?w=1920&h=600&fit=crop&opacity=0.1')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/95 to-pink-600/95"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible.ambassador ? 1 : 0, y: isVisible.ambassador ? 0 : 50 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full mb-8 border border-white/30">
              <StarSolidIcon className="h-8 w-8 text-yellow-300" />
              <span className="text-white font-bold text-lg uppercase tracking-wider">
                Join Our Elite Community
              </span>
              <StarSolidIcon className="h-8 w-8 text-yellow-300" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 drop-shadow-2xl">
              Become a Brand Ambassador
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              Join our exclusive ambassador program and earn <span className="text-yellow-300 font-bold">up to 25% commission</span> for every referral. Share your love for African fashion and build your fashion empire!
            </p>
            
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/ambassador" 
                  className="bg-white text-purple-600 px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/30 transform hover:scale-105 flex items-center gap-3"
                >
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  Start Earning Today
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <div className="flex items-center gap-6 text-purple-100">
                <div className="text-center bg-white/15 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/30">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-bold text-2xl">5,000+</div>
                  <div className="text-sm">Active Ambassadors</div>
                </div>
                <div className="text-center bg-white/15 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/30">
                  <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-bold text-2xl">KES 2M+</div>
                  <div className="text-sm">Paid in Commissions</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection />

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1920&h=600&fit=crop&opacity=0.1')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-gold-400/30">
              <MapPinIcon className="h-6 w-6 text-gold-400" />
              <span className="text-gold-300 font-bold text-sm uppercase tracking-wider">
                Visit Our Showroom
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Embrace African Elegance?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Visit our studio in Wangige Market, Kiambu County, or contact us for a personalized fashion consultation
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <MapPinIcon className="h-8 w-8 text-gold-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Visit Us</h3>
                <p className="text-gray-300 text-sm">Wangige Market, Kiambu County, Kenya</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <PhoneIcon className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Call Us</h3>
                <p className="text-gray-300 text-sm">+254 711 234 567</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <EnvelopeIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Email Us</h3>
                <p className="text-gray-300 text-sm">info@higifashion.co.ke</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/shop" 
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-12 py-6 rounded-full font-bold text-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                Start Shopping Now
              </Link>
              <Link 
                to="/contact" 
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-12 py-6 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PhoneIcon className="h-6 w-6" />
                Get In Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 