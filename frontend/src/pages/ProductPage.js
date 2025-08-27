import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  HeartIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import ReviewSection from '../components/common/ReviewSection';
import { useAuth } from '../context/AuthContext';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('description');

  // Fetch product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        if (data.success) {
          setProduct(data.product);
          setSelectedColor(data.product.colors?.[0] || '');
          const firstSize = data.product.sizes?.[0];
          let initialSize = '';
          if (typeof firstSize === 'string') {
            initialSize = firstSize;
          } else if (firstSize) {
            initialSize = firstSize.value || firstSize.name || '';
          }
          setSelectedSize(initialSize);
          setSelectedFabric(data.product.fabrics?.[0]?.value || '');
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const currentQuantityInCart = getItemQuantity(product?._id || id, selectedSize, selectedColor, selectedFabric);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to the cart');
      navigate('/login');
      return;
    }

    const needsSize = product.sizes && product.sizes.length > 0;
    // Disable colour selection requirement
    const needsColor = false;
    const needsFabric = product.fabrics && product.fabrics.length > 0;

    if ((needsSize && !selectedSize) || (needsColor && !selectedColor) || (needsFabric && !selectedFabric)) {
      const missing = [];
      if (needsSize && !selectedSize) missing.push('size');
      if (needsColor && !selectedColor) missing.push('color');
      if (needsFabric && !selectedFabric) missing.push('fabric');
      toast.error(`Please select ${missing.join(' and ')}`);
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.images?.[0] || 'https://placehold.co/300x300?text=No+Image'
    }, quantity, selectedSize, selectedColor, selectedFabric);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateSavings = () => {
    if (product.originalPrice) {
      return product.originalPrice - product.price;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container-width section-padding py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-gold-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-600">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              className="relative overflow-hidden rounded-xl bg-white shadow-lg"
              layoutId="product-image"
            >
              {product.videoUrl ? (
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full h-96 lg:h-[600px] object-contain bg-white"
                />
              ) : (
                <img
                  src={product.images?.[activeImageIndex]?.url || product.images?.[activeImageIndex] || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product.name}
                  className="w-full h-96 lg:h-[600px] object-contain bg-white"
                />
              )}
              
              {/* Sale Badge */}
              {product.sale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  SALE
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </motion.div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {(product.images || []).map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative overflow-hidden rounded-lg bg-white shadow-md ${
                    activeImageIndex === index ? 'ring-2 ring-gold-500' : ''
                  }`}
                >
                  <img
                    src={image.url || image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', image.url || image);
                      e.target.src = 'https://placehold.co/200x200?text=No+Image';
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <p className="text-sm text-gray-600 mb-2">{product.brand || 'Higi Fashion'}</p>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating?.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating?.average || 0} ({product.rating?.count || product.reviewsCount || 0} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      Save {formatPrice(calculateSavings())}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color selection hidden per requirement */}

            {/* Fabric Selection */}
            {product.fabrics && product.fabrics.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fabric</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(product.fabrics || []).map((fabric) => (
                  <motion.button
                    key={fabric.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFabric(fabric.value)}
                    className={`relative rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                      selectedFabric === fabric.value
                        ? 'border-gold-500 ring-2 ring-gold-200'
                        : 'border-gray-300'
                    }`}
                    style={{ width: '72px', height: '72px' }}
                  >
                    {fabric.imageUrl ? (
                      <img
                        src={fabric.imageUrl}
                        alt={fabric.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-700 text-sm p-2">
                        {fabric.name}
                      </div>
                    )}
                    {selectedFabric === fabric.value && (
                      <CheckIcon className="h-6 w-6 text-white absolute top-1 right-1" />
                    )}
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Selected: {(product.fabrics || []).find(f => f.value === selectedFabric)?.name}
              </p>
            </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-4 gap-3">
                {(product.sizes || []).map((size) => {
                  const isString = typeof size === 'string';
                  const value = isString ? size : size.value || size.name;
                  const label = isString ? size : size.name || size.value;
                  const available = isString ? true : size.available !== false;
                  return (
                    <motion.button
                      key={value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(value)}
                      disabled={!available}
                      className={`py-3 px-4 text-center rounded-lg border-2 font-medium ${
                        selectedSize === value
                          ? 'border-gold-500 bg-gold-50 text-gold-700'
                          : available
                          ? 'border-gray-300 hover:border-gold-300 text-gray-700'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {currentQuantityInCart > 0 && (
                  <p className="text-sm text-green-600">
                    {currentQuantityInCart} in cart
                  </p>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-gold-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                Add to Cart
              </motion.button>

              <Link
                to="/cart"
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Buy Now
              </Link>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium">Free shipping on orders over KES 10,000</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowPathIcon className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">14-day return policy</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium">Authentic African wear guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['description', 'features', 'care', 'size-guide'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-4 font-medium capitalize ${
                    selectedTab === tab
                      ? 'text-gold-600 border-b-2 border-gold-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedTab === 'description' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {selectedTab === 'features' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Features</h3>
                    {product.features ? (
                      <ul className="space-y-2">
                        {(Array.isArray(product.features) ? product.features : [product.features]).map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No features listed for this product.</p>
                    )}
                    
                    {/* Additional AI-generated fields */}
                    {product.fabric && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Fabric</h4>
                        <p className="text-gray-700">{product.fabric}</p>
                      </div>
                    )}
                    
                    {product.occasion && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Perfect For</h4>
                        <p className="text-gray-700">{product.occasion}</p>
                      </div>
                    )}
                    
                    {product.culturalSignificance && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Cultural Significance</h4>
                        <p className="text-gray-700">{product.culturalSignificance}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'care' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Care Instructions</h3>
                    {product.careInstructions ? (
                      <div className="text-gray-700 leading-relaxed">
                        {typeof product.careInstructions === 'string' ? (
                          <p>{product.careInstructions}</p>
                        ) : (
                          <ul className="space-y-2">
                            {product.careInstructions.map((instruction, index) => (
                              <li key={index} className="flex items-center gap-3">
                                <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">No care instructions provided for this product.</p>
                    )}
                    
                    {product.stylingTips && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Styling Tips</h4>
                        <p className="text-gray-700">{product.stylingTips}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'size-guide' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Size Guide</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Chest (inches)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Length (inches)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Sleeve (inches)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(product.sizeGuide || {}).map(([size, measurements]) => (
                            <tr key={size}>
                              <td className="border border-gray-300 px-4 py-2 font-medium">{size}</td>
                              <td className="border border-gray-300 px-4 py-2">{measurements.chest}</td>
                              <td className="border border-gray-300 px-4 py-2">{measurements.length}</td>
                              <td className="border border-gray-300 px-4 py-2">{measurements.sleeve}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewSection productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductPage; 