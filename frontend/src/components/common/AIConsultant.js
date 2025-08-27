import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  ScissorsIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AIConsultant = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: ''
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('measurements');
  const [virtualTryOn, setVirtualTryOn] = useState(null);
  const [bodyType, setBodyType] = useState(null);
  const [size, setSize] = useState(null);
  const [colorSuggestions, setColorSuggestions] = useState([]);
  const [patternSuggestions, setPatternSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [generatingTryOn, setGeneratingTryOn] = useState(false);
  const [stylePreferences, setStylePreferences] = useState({
    occasion: 'casual',
    fit: 'regular',
    colors: [],
    patterns: []
  });

  const tabs = [
    { id: 'measurements', name: 'Measurements', icon: ScissorsIcon },
    { id: 'virtual-try-on', name: 'Virtual Try-On', icon: ShoppingBagIcon },
    { id: 'style-profile', name: 'Style Profile', icon: SwatchIcon },
    { id: 'recommendations', name: 'Recommendations', icon: SparklesIcon }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMeasurements({
      height: '',
      weight: '',
      chest: '',
      waist: '',
      hips: ''
    });
    setRecommendations(null);
    setVirtualTryOn(null);
    setBodyType(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('preferences', JSON.stringify(stylePreferences));

    try {
      const response = await fetch('/api/ai/analyze-measurements', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMeasurements(data.measurements);
        setRecommendations(data.recommendations);
        setBodyType(data.bodyType);
        setSize(data.size || null);
        setColorSuggestions(data.colorSuggestions || []);
        setPatternSuggestions(data.patternSuggestions || []);
        // Automatically switch to recommendations tab after analysis
        setActiveTab('recommendations');
        toast.success('Analysis complete!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const updateStylePreferences = (key, value) => {
    setStylePreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fetch products for virtual try-on
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products?limit=8');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Generate virtual try-on
  const generateVirtualTryOn = async (product) => {
    if (!selectedImage || !product) {
      toast.error('Please upload your photo and select a product');
      return;
    }

    setGeneratingTryOn(true);
    setSelectedProduct(product);

    try {
      // For now, we'll simulate a virtual try-on by showing the product
      // In a real implementation, this would call an AI API to generate the try-on
      setTimeout(() => {
        // Simulate AI processing
        setVirtualTryOn({
          productImage: product.images?.[0] || '/placeholder.jpg',
          productName: product.name,
          productId: product._id,
          message: `Based on your measurements, this ${product.name} would look great on you in size ${size || 'M'}!`
        });
        setGeneratingTryOn(false);
        toast.success('Virtual try-on generated!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate virtual try-on');
      setGeneratingTryOn(false);
    }
  };

  // Load products when virtual try-on tab is selected
  useEffect(() => {
    if (activeTab === 'virtual-try-on' && products.length === 0) {
      fetchProducts();
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI Fashion Consultant
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get personalized size recommendations, try on outfits virtually, and receive expert style advice tailored to your body type and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Image Upload and Analysis */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="space-y-2">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <CameraIcon className="w-5 h-5 mr-2" />
                      Choose Photo
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a clear, full-body photo in good lighting
                  </p>
                </div>
              )}
            </div>

            {selectedImage && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={analyzeImage}
                disabled={loading}
                className={`w-full mt-4 py-3 rounded-lg flex items-center justify-center space-x-2 ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white font-medium`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Analyze Photo</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Style Preferences */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Style Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Occasion
                </label>
                <select
                  value={stylePreferences.occasion}
                  onChange={(e) => updateStylePreferences('occasion', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="casual">Casual</option>
                  <option value="business">Business</option>
                  <option value="formal">Formal</option>
                  <option value="party">Party</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Fit
                </label>
                <select
                  value={stylePreferences.fit}
                  onChange={(e) => updateStylePreferences('fit', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="slim">Slim Fit</option>
                  <option value="regular">Regular Fit</option>
                  <option value="loose">Loose Fit</option>
                  <option value="oversized">Oversized</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {activeTab === 'measurements' && measurements && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {size && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg text-center">
                  <h4 className="text-sm font-medium text-purple-700 mb-1">Recommended Size</h4>
                  <p className="text-2xl font-bold text-purple-800">{size}</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Measurements
                </h3>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ChevronDownIcon className={`w-5 h-5 transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showDetails && (
                <div className="space-y-3">
                  {Object.entries(measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {colorSuggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {colorSuggestions.map((color, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patternSuggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Patterns</h4>
                  <div className="flex flex-wrap gap-2">
                    {patternSuggestions.map((pattern, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'virtual-try-on' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Virtual Try-On
              </h3>
              {virtualTryOn ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-800 font-medium mb-2">{virtualTryOn.message}</p>
                    <img
                      src={virtualTryOn.productImage}
                      alt={virtualTryOn.productName}
                      className="w-full rounded-lg mb-2"
                    />
                    <p className="text-sm text-gray-600">Product: {virtualTryOn.productName}</p>
                  </div>
                  <button
                    onClick={() => setVirtualTryOn(null)}
                    className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    Try Another Outfit
                  </button>
                </div>
              ) : (
                <div>
                  {!selectedImage ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Please upload your photo first to use virtual try-on</p>
                    </div>
                  ) : loadingProducts ? (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                      <p className="text-gray-600 mt-2">Loading products...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">Select a product to try on virtually:</p>
                      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {products.map((product) => (
                          <div
                            key={product._id}
                            className="border rounded-lg p-2 cursor-pointer hover:border-purple-500 transition-colors"
                            onClick={() => generateVirtualTryOn(product)}
                          >
                            <img
                              src={product.images?.[0] || '/placeholder.jpg'}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                            <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                            <p className="text-xs text-purple-600">KES {product.price?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      {generatingTryOn && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <SparklesIcon className="w-12 h-12 animate-pulse mx-auto text-purple-600 mb-2" />
                            <p className="text-purple-700 font-medium">Generating virtual try-on...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'style-profile' && bodyType && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Style Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Body Type</h4>
                  <p className="text-gray-600">{bodyType.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Best Styles For You</h4>
                  <ul className="mt-2 space-y-2">
                    {bodyType.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && recommendations && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personalized Recommendations
              </h3>
              <div className="space-y-4">
                {Array.isArray(recommendations) ? recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{rec}</p>
                  </div>
                )) : (
                  <p className="text-gray-700">{recommendations}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConsultant; 