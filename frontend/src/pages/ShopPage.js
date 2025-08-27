import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  HeartIcon,
  StarIcon,
  ShoppingBagIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Ensure axios has baseURL configured (fallback in case AuthContext isn't imported yet)
if (!axios.defaults.baseURL) {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    axios.defaults.baseURL = 'http://localhost:5010';
  }
}

const ShopPage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  // Default to show all prices (max 50,000)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
    return new Set(saved.map(p => p._id));
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Categories list from API
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Products', count: 0 }
  ]);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/categories');
      if (data.success) {
        const apiCategories = data.categories.map(cat => ({
          id: cat.name,
          name: cat.name,
          count: cat.product_count
        }));
        
        setCategories([
          { id: 'all', name: 'All Products', count: 0 }, // Will be updated after products fetch
          ...apiCategories
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      });

      const { data } = await axios.get(`/api/products?${queryParams}`, { signal: controller.signal });
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
        
        // Update "All Products" count
        setCategories(prev => prev.map(cat => 
          cat.id === 'all' ? { ...cat, count: data.pagination.total || data.products.length } : cat
        ));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      if (axios.isCancel?.(error)) {
        console.warn('Products request aborted');
      } else {
        console.error('Error fetching products:', error?.message || error);
        toast.error('Failed to load products');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedCategory, searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, priceRange, sortBy]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      let stored = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
      if (newFavorites.has(productId)) {
        // remove
        newFavorites.delete(productId);
        stored = stored.filter(p => p._id !== productId);
      } else {
        // add
        newFavorites.add(productId);
        const prod = products.find(p => p._id === productId);
        if (prod) {
          stored.push({
            _id: prod._id,
            name: prod.name,
            price: prod.price,
            image: (typeof prod.images?.[0] === 'string' ? prod.images[0] : prod.images?.[0]?.url) || '',
            videoUrl: prod.videoUrl || ''
          });
        }
      }
      localStorage.setItem('favoriteProducts', JSON.stringify(stored));
      return newFavorites;
    });
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to the cart');
      navigate('/login');
      return;
    }
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
      image: product.images?.[0]?.url,
      quantity: 1
    });
    toast.success(`${product.name} added to cart`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gold-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading African Collections</h3>
          <p className="text-gray-600">Discovering beautiful African wear just for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gold-600 via-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 drop-shadow-2xl">
              Shop African Fashion
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover over 300+ authentic African wear pieces that celebrate heritage and embrace modern style
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Search for African wear, styles, colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-14 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
              <MagnifyingGlassIcon className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gold-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length} African wear products found
                </span>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FunnelIcon className="h-5 w-5" />
                  Filters
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Price Range:</label>
                  <select
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value={50000}>All Prices</option>
                    <option value={10000}>Under KES 10,000</option>
                    <option value={20000}>Under KES 20,000</option>
                    <option value={30000}>Under KES 30,000</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative">
                    {/* Square aspect wrapper so full image is visible */}
                    <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                      {product.videoUrl ? (
                        <video
                          src={product.videoUrl}
                          controls
                          className="w-full h-full object-contain rounded-md"
                        />
                      ) : (
                        <img
                          src={product.images?.[0]?.url || product.images?.[0] || 'https://placehold.co/600x600?text=No+Image'}
                          alt={product.name}
                          onError={(e) => {
                            console.error('Media failed to load:', product.images?.[0]?.url || product.images?.[0]);
                            e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image';
                          }}
                          className="w-full h-full object-contain bg-white"
                        />
                      )}
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.sale && (
                        <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                          SALE
                        </span>
                      )}
                      {product.featured && (
                        <span className="bg-gold-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                          FEATURED
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product._id)}
                      className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
                    >
                      {favorites.has(product._id) ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 py-2.5 px-4 rounded-lg text-center font-semibold hover:bg-white transition-all text-sm shadow-lg"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-gold-500 hover:bg-gold-600 text-white p-2.5 rounded-lg transition-all shadow-lg"
                        >
                          <ShoppingBagIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating?.average || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {product.rating?.average || 0} ({product.rating?.count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quick Add to Cart */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gold-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* No products found */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-6">
                <ShoppingBagIcon className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No products found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Try adjusting your search or filters to find the perfect African wear for you
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 50000 });
                    setSortBy('featured');
                    setSearchQuery('');
                  }}
                  className="bg-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-700 transition-colors"
                >
                  Show All Products
                </button>
                <Link
                  to="/contact"
                  className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Contact for Custom Orders
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShopPage; 