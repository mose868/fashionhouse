import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  StarIcon,
  HeartIcon,
  ChevronDownIcon,
  SparklesIcon,
  GiftIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  InformationCircleIcon,
  PhoneIcon,
  NewspaperIcon,
  UserGroupIcon,
  TagIcon,
  ClockIcon,
  TruckIcon,
  ScissorsIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({
    shop: false,
    about: false
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const isHomePage = location.pathname === '/';
  const cartItemsCount = itemCount;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(new Set(savedFavorites));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location]);

  const toggleDropdown = (dropdown) => {
    setShowDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const closeAllDropdowns = () => {
    setShowDropdowns({
      shop: false,
      about: false
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Focus the search input when opening
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const toggleFavorites = () => {
    // Navigate to favorites page using React Router
    navigate('/favorites');
  };

  const shopDropdownItems = [
    { 
      name: 'All Collections', 
      href: '/shop', 
      icon: BuildingStorefrontIcon,
      description: 'Browse our complete collection'
    },
    { 
      name: 'Traditional Wear', 
      href: '/shop?category=traditional', 
      icon: StarIcon,
      description: 'Authentic African heritage pieces'
    },
    { 
      name: 'Ankara Collection', 
      href: '/shop?category=ankara', 
      icon: SparklesIcon,
      description: 'Vibrant contemporary prints'
    },
    { 
      name: 'Kente Luxury', 
      href: '/shop?category=kente', 
      icon: StarIcon,
      description: 'Royal handwoven masterpieces'
    },
    { 
      name: 'Sale Items', 
      href: '/shop?sale=true', 
      icon: TagIcon,
      description: 'Special offers and discounts'
    }
  ];

  const aboutDropdownItems = [
    { 
      name: 'Our Story', 
      href: '/about', 
      icon: InformationCircleIcon,
      description: 'Learn about our heritage'
    },
    { 
      name: 'Ambassador Program', 
      href: '/ambassador', 
      icon: UserGroupIcon,
      description: 'Join our fashion community'
    },
  ];



  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <SparklesIcon className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                  <HeartSolidIcon className="h-3 w-3 text-white ml-0.5 mt-0.5" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-2xl font-display font-bold bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent ${
                  !isScrolled && isHomePage ? 'text-white' : ''
                }`}>
                  Higi Fashion
                </h1>
                <p className={`text-xs font-medium ${
                  isScrolled || !isHomePage ? 'text-gray-600' : 'text-gold-200'
                }`}>
                  Authentic African Elegance
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Home */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                location.pathname === '/'
                  ? 'bg-gold-100 text-gold-800'
                  : isScrolled || !isHomePage
                    ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            {/* Shop Dropdown */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('shop')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 ${
                  location.pathname.includes('/shop')
                    ? 'bg-gold-100 text-gold-800'
                    : isScrolled || !isHomePage
                      ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <BuildingStorefrontIcon className="h-4 w-4" />
                Shop
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showDropdowns.shop ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showDropdowns.shop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    onMouseLeave={closeAllDropdowns}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="h-5 w-5 text-gold-500" />
                        <h3 className="font-bold text-gray-900">Shop Collections</h3>
                      </div>
                      <div className="space-y-2">
                        {shopDropdownItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={closeAllDropdowns}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gold-50 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center group-hover:bg-gold-200 transition-colors">
                              <item.icon className="h-5 w-5 text-gold-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-gold-800">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gold-50 to-gold-100 p-4">
                      <Link
                        to="/shop"
                        onClick={closeAllDropdowns}
                        className="block w-full text-center bg-gold-500 text-white py-2 rounded-lg font-semibold hover:bg-gold-600 transition-colors"
                      >
                        View All Collections →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Dropdown */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('about')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 ${
                  location.pathname.includes('/about') || location.pathname.includes('/ambassador') || location.pathname.includes('/blog')
                    ? 'bg-gold-100 text-gold-800'
                    : isScrolled || !isHomePage
                      ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <InformationCircleIcon className="h-4 w-4" />
                About
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showDropdowns.about ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showDropdowns.about && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    onMouseLeave={closeAllDropdowns}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <HeartIcon className="h-5 w-5 text-red-500" />
                        <h3 className="font-bold text-gray-900">About Higi Fashion</h3>
                      </div>
                      <div className="space-y-2">
                        {aboutDropdownItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={closeAllDropdowns}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <item.icon className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-red-800">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Consultant Link */}
            <Link
              to="/ai-consultant"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                location.pathname === '/ai-consultant'
                  ? 'bg-purple-100 text-purple-800'
                  : isScrolled || !isHomePage
                    ? 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              AI Consultant
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                location.pathname === '/contact'
                  ? 'bg-gold-100 text-gold-800'
                  : isScrolled || !isHomePage
                    ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <PhoneIcon className="h-4 w-4" />
              Contact
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSearch}
              className={`p-2 rounded-full transition-all duration-300 ${
                isScrolled || !isHomePage
                  ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </motion.button>

            {/* Wishlist Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFavorites}
              className={`p-2 rounded-full transition-all duration-300 relative ${
                isScrolled || !isHomePage
                  ? 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <HeartIcon className="h-5 w-5" />
              {favorites.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favorites.size}
                </span>
              )}
            </motion.button>

            {/* Cart Icon */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cart"
                className={`p-2 rounded-full transition-all duration-300 relative ${
                  isScrolled || !isHomePage
                    ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBagIcon className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className={`relative h-9 w-9 flex items-center justify-center rounded-full bg-gold-500 text-white font-semibold focus:outline-none ring-0 overflow-hidden transition-all duration-300 ${
                    isScrolled || !isHomePage
                      ? 'hover:ring-2 hover:ring-gold-400'
                      : 'hover:ring-2 hover:ring-white/70'
                  }`}
                >
                  {user.photo ? (
                    <img src={user.photo} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="select-none">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </motion.button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Dashboard</Link>
                    )}
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-6 py-2 rounded-full font-semibold hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className={`lg:hidden p-2 rounded-full transition-all duration-300 ${
                isScrolled || !isHomePage
                  ? 'text-gray-700 hover:text-gold-600 hover:bg-gold-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/20"
          >
            <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-colors"
              >
                <HomeIcon className="h-5 w-5" />
                Home
              </Link>
              
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-colors"
              >
                <BuildingStorefrontIcon className="h-5 w-5" />
                Shop
              </Link>
              
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-colors"
              >
                <InformationCircleIcon className="h-5 w-5" />
                About
              </Link>
              
              <Link
                to="/ambassador"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-colors"
              >
                <UserGroupIcon className="h-5 w-5" />
                Ambassador Program
              </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-colors"
              >
                <PhoneIcon className="h-5 w-5" />
                Contact
              </Link>
              
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block bg-gradient-to-r from-gold-500 to-gold-600 text-white px-6 py-3 rounded-xl font-semibold text-center hover:from-gold-600 hover:to-gold-700 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Search Products</h2>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for African wear, styles, colors..."
                      className="w-full px-6 py-4 pr-14 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg"
                    />
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gold-500 hover:text-gold-600 transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={!searchQuery.trim()}
                      className="bg-gold-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Search Products
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/shop"
                      onClick={() => setSearchOpen(false)}
                      className="text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      Browse All Products
                    </Link>
                    <Link
                      to="/collections"
                      onClick={() => setSearchOpen(false)}
                      className="text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      View Collections
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 