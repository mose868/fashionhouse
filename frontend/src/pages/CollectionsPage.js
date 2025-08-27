import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  HeartIcon,
  StarIcon,
  ShoppingBagIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';

const CollectionsPage = () => {
  const { category } = useParams();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Collections', count: 0 }
  ]);

  // Ensure axios base URL is configured for local dev
  if (!axios.defaults.baseURL) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      axios.defaults.baseURL = 'http://localhost:5010';
    }
  }

  // Fetch products and build dynamic categories
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/products?limit=1000');
      if (data.success) {
        const fetched = Array.isArray(data.products) ? data.products : [];
        setProducts(fetched);

        // Build categories from product.category values
        const categoryCounts = {};
        fetched.forEach((p) => {
          const cat = p.category && p.category.trim() !== '' ? p.category : 'Uncategorized';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        const dynamicCategories = Object.keys(categoryCounts)
          .sort()
          .map((cat) => ({ id: cat, name: cat, count: categoryCounts[cat] }));

        setCategories([
          { id: 'all', name: 'All Collections', count: fetched.length },
          ...dynamicCategories
        ]);
      } else {
        setProducts([]);
        setCategories([{ id: 'all', name: 'All Collections', count: 0 }]);
      }
    } catch (_) {
      setProducts([]);
      setCategories([{ id: 'all', name: 'All Collections', count: 0 }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => {
        const cat = p.category && p.category.trim() !== '' ? p.category : 'Uncategorized';
        return cat === selectedCategory;
      });
    }

    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || ''
    }, 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading our beautiful African collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 text-white py-16">
        <div className="container-width section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              African Fashion Collections
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
              Discover authentic African wear that celebrates our rich heritage and contemporary style
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.filter(c => c.id !== 'all').map((c) => (
                <span key={c.id} className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  {c.name} ({c.count})
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Removed decorative sample collections grid */}

      {/* Filters and Products */}
      <section className="py-8">
        <div className="container-width section-padding">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gold-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gold-100'
                  }`}
                >
                  All Collections
                </button>
                {categories.filter(c => c.id !== 'all').map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedCategory(collection.id)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === collection.id
                        ? 'bg-gold-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gold-100'
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>

              {/* Sort and Price Filter */}
              <div className="flex gap-4 items-center">
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

                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} products
                  </span>
                </div>
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
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={(typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || 'https://placehold.co/600x600?text=No+Image'}
                      alt={product.name}
                      className="w-full h-64 object-contain bg-white"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image'; }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.sale && (
                        <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                          SALE
                        </span>
                      )}
                      {product.featured && (
                        <span className="bg-gold-500 text-white px-2 py-1 text-xs font-semibold rounded">
                          FEATURED
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
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
                          className="flex-1 bg-white text-gray-900 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-100 transition-colors text-sm"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-gold-500 text-white p-2 rounded-lg hover:bg-gold-600 transition-colors"
                        >
                          <ShoppingBagIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
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
                      <span className="text-sm text-gray-600">
                        {product.rating?.average || 0} ({product.rating?.count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
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
                      className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gold-600 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* No products found */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingBagIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters. If you're the admin, upload products to see them here.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 50000]);
                  setSortBy('featured');
                }}
                className="btn-primary"
              >
                Show All Products
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage; 