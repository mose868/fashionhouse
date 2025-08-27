import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  ShoppingBagIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const SearchResultsPage = () => {
  const location = useLocation();
  const { addToCart } = useCart();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 50000],
    sortBy: 'relevance'
  });

  // Mock product data for search results
  const mockProducts = [
    {
      id: 1,
      name: "Traditional Ankara Dress",
      price: 15000,
      originalPrice: 18000,
      image: "https://images.unsplash.com/photo-1564327002790-dec63f50e9ea?w=500",
      category: "traditional",
      rating: 4.8,
      reviews: 42,
      description: "Beautiful traditional Ankara dress with modern cut"
    },
    {
      id: 2,
      name: "Kente Dashiki Shirt",
      price: 8500,
      image: "https://images.unsplash.com/photo-1568046218069-4c5bdb5fc1c6?w=500",
      category: "traditional",
      rating: 4.6,
      reviews: 28,
      description: "Authentic Kente dashiki shirt for men"
    },
    {
      id: 3,
      name: "Modern African Print Blazer",
      price: 22000,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500",
      category: "modern",
      rating: 4.9,
      reviews: 65,
      description: "Contemporary blazer with African print details"
    },
    {
      id: 4,
      name: "African Print Headwrap",
      price: 3500,
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
      category: "accessories",
      rating: 4.7,
      reviews: 33,
      description: "Colorful headwrap with authentic African prints"
    },
    {
      id: 5,
      name: "Ankara Jumpsuit",
      price: 18500,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
      category: "modern",
      rating: 4.5,
      reviews: 19,
      description: "Stylish Ankara jumpsuit for modern occasions"
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate search with mock data
    setTimeout(() => {
      let searchResults = mockProducts;
      
      if (searchQuery.trim()) {
        searchResults = mockProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setResults(searchResults);
      setFilteredResults(searchResults);
      setIsLoading(false);
    }, 1000);
  }, [searchQuery]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(new Set(savedFavorites));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      window.history.pushState({}, '', newUrl);
      // Trigger search
      setIsLoading(true);
      setTimeout(() => {
        let searchResults = mockProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(searchResults);
        setFilteredResults(searchResults);
        setIsLoading(false);
      }, 800);
    }
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(productId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const handleAddToCart = (product) => {
    addToCart({
      _id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    }, 1, 'M', 'Default');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Search Header */}
      <section className="bg-gradient-to-r from-gold-600 to-gold-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {query ? `Search Results for "${query}"` : 'Search Products'}
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for African wear, styles, colors..."
                  className="w-full px-6 py-4 pr-14 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gold-600 text-white p-2 rounded-full hover:bg-gold-700 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoading ? 'Searching...' : `${filteredResults.length} Products Found`}
            </h2>
            {query && !isLoading && (
              <p className="text-gray-600 mt-1">
                Showing results for "{query}"
              </p>
            )}
          </div>
          
          {!isLoading && filteredResults.length > 0 && (
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && (
          <AnimatePresence>
            {filteredResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredResults.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                      >
                        {favorites.has(product.id) ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-600" />
                        )}
                      </button>

                      {/* Sale Badge */}
                      {product.originalPrice && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                          SALE
                        </div>
                      )}

                      {/* Quick Add to Cart */}
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-gold-600 text-white py-2 rounded-lg font-semibold hover:bg-gold-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBagIcon className="h-4 w-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="text-gray-400 mb-6">
                  <MagnifyingGlassIcon className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No products found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your search terms or browse our collections
                </p>
                <div className="space-x-4">
                  <Link
                    to="/shop"
                    className="bg-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-700 transition-colors"
                  >
                    Browse All Products
                  </Link>
                  <Link
                    to="/collections"
                    className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    View Collections
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage; 