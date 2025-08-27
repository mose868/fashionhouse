import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const ProductSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sizes: searchParams.getAll('sizes') || [],
    colors: searchParams.getAll('colors') || [],
    sortBy: searchParams.get('sortBy') || 'newest',
    inStock: searchParams.get('inStock') === 'true'
  });

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'casual', name: 'Casual Wear' },
    { id: 'formal', name: 'Formal Wear' },
    { id: 'bridal', name: 'Bridal Collection' },
    { id: 'streetwear', name: 'Streetwear' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'bags', name: 'Bags' },
    { id: 'jewelry', name: 'Jewelry' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'name-asc', name: 'Name: A to Z' },
    { id: 'name-desc', name: 'Name: Z to A' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'popular', name: 'Most Popular' }
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42'];
  const availableColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Grey', hex: '#808080' },
    { name: 'Red', hex: '#DC143C' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Pink', hex: '#FFC0CB' }
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => v && params.append(key, v));
        } else if (value) {
          params.append(key, value);
        }
      });
      params.append('page', currentPage);
      params.append('limit', 12);

      const response = await fetch(`/api/products/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => v && params.append(key, v));
      } else if (value) {
        params.append(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const updateArrayFilter = (key, value) => {
    setFilters(prev => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sizes: [],
      colors: [],
      sortBy: 'newest',
      inStock: false
    });
    setCurrentPage(1);
  };

  const toggleWishlist = async (productId) => {
    try {
      const method = wishlist.has(productId) ? 'DELETE' : 'POST';
      const response = await fetch(`/api/customers/wishlist/${productId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setWishlist(prev => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            newSet.delete(productId);
          } else {
            newSet.add(productId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity: 1
    });
  };

  const totalPages = Math.ceil(totalProducts / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-navy via-navy/90 to-gold/20 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-playfair font-bold mb-4"
          >
            Discover Fashion
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-200"
          >
            Find your perfect style from our curated collection
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-1 mb-8 lg:mb-0"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-navy">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-gold hover:text-gold/80 text-sm"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (KES)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => updateArrayFilter('sizes', size)}
                      className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                        filters.sizes.includes(size)
                          ? 'bg-gold text-white border-gold'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colors
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => updateArrayFilter('colors', color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        filters.colors.includes(color.name)
                          ? 'border-gold ring-2 ring-gold ring-offset-2'
                          : 'border-gray-300 hover:border-gold'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort and Results Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy">
                    {totalProducts} Product{totalProducts !== 1 ? 's' : ''} Found
                  </h3>
                  {filters.search && (
                    <p className="text-gray-600">
                      Showing results for "{filters.search}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.images[0]?.url || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleWishlist(product._id)}
                          className={`p-2 rounded-full shadow-lg transition-colors ${
                            wishlist.has(product._id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 space-y-2">
                        {product.isNewArrival && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                            New
                          </span>
                        )}
                        {product.isOnSale && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                            Sale
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="px-2 py-1 bg-gold text-white text-xs font-medium rounded">
                            Bestseller
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-xs text-gold font-medium uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-navy mb-2 hover:text-gold transition-colors">
                        <Link to={`/products/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.shortDescription || product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-navy">
                            KES {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              KES {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {product.rating?.average > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating.average) ? 'fill-current' : 'fill-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({product.rating.count})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Size and Color Options */}
                      {(product.variants?.sizes?.length > 0 || product.variants?.colors?.length > 0) && (
                        <div className="mb-4 space-y-2">
                          {product.variants.sizes?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Sizes:</span>
                              <div className="flex gap-1">
                                {product.variants.sizes.slice(0, 4).map(size => (
                                  <span
                                    key={size.size}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {size.size}
                                  </span>
                                ))}
                                {product.variants.sizes.length > 4 && (
                                  <span className="text-xs text-gray-500">+{product.variants.sizes.length - 4}</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {product.variants.colors?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Colors:</span>
                              <div className="flex gap-1">
                                {product.variants.colors.slice(0, 4).map(color => (
                                  <div
                                    key={color.name}
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                  />
                                ))}
                                {product.variants.colors.length > 4 && (
                                  <span className="text-xs text-gray-500">+{product.variants.colors.length - 4}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="flex-1 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 transition-colors text-center text-sm"
                        >
                          View Details
                        </Link>
                        {product.inStock && (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors text-sm"
                          >
                            Add to Cart
                          </button>
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
                transition={{ delay: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse our collections
                </p>
                <div className="space-x-4">
                  <button
                    onClick={clearFilters}
                    className="bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <Link
                    to="/collections"
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mt-12 flex justify-center"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-gold text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === totalPages
                            ? 'bg-gold text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchPage; 