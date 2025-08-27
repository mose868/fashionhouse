import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon,
  StarIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const { addToCart } = useCart();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const mockProducts = useMemo(() => [
    {
      id: 1,
      name: "African Print Maxi Dress",
      price: 129.99,
      image: "/images/products/dress1.jpg",
      category: "Dresses"
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
    }
  ], []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
    setFavoriteProducts(stored);
    setIsLoading(false);
  }, []);

  const removeFavorite = (productId) => {
    const updated = favoriteProducts.filter(p => p._id !== productId);
    setFavoriteProducts(updated);
    localStorage.setItem('favoriteProducts', JSON.stringify(updated));
    toast.success('Removed from favorites');
  };

  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gold-500 mx-auto mb-6"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <HeartSolidIcon className="h-8 w-8 text-red-500" />
              My Favorites
            </h1>
            <p className="text-gray-600 mt-2">
              {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'} in your favorites
            </p>
          </div>
          
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>

        {favoriteProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <HeartIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items to your favorites to keep track of products you love!
            </p>
            <div className="space-x-4">
              <Link
                to="/shop"
                className="bg-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-700 transition-colors"
              >
                Browse Products
              </Link>
              <Link
                to="/collections"
                className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                View Collections
              </Link>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image || 'https://placehold.co/400x400'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Remove from Favorites */}
                    <button
                      onClick={() => removeFavorite(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gold-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gold-700 transition-colors text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage; 