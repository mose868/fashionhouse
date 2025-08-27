import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PhotoIcon,
  VideoCameraIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AIProductGenerator = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    'Ankara Dress',
    'Traditional Gown',
    'Modern African Wear',
    'Casual African Fashion',
    'Formal African Attire',
    'Wedding Collection',
    'Party Wear',
    'Office Wear',
    'Cultural Attire',
    'Contemporary African'
  ];

  const priceRanges = [
    'Budget (KES 1,000 - 5,000)',
    'Mid-range (KES 5,000 - 15,000)',
    'Premium (KES 15,000 - 30,000)',
    'Luxury (KES 30,000+)',
    'Market Appropriate - AI Analysis'
  ];

  const kenyanMarketPricing = {
    'Ankara Dress': { min: 2500, max: 12000, avg: 6500 },
    'Traditional Gown': { min: 8000, max: 25000, avg: 15000 },
    'Modern African Wear': { min: 3500, max: 18000, avg: 9500 },
    'Casual African Fashion': { min: 1500, max: 8000, avg: 4500 },
    'Formal African Attire': { min: 12000, max: 35000, avg: 22000 },
    'Wedding Collection': { min: 25000, max: 80000, avg: 45000 },
    'Party Wear': { min: 5000, max: 20000, avg: 12000 },
    'Office Wear': { min: 3000, max: 15000, avg: 8000 },
    'Cultural Attire': { min: 6000, max: 25000, avg: 14000 },
    'Contemporary African': { min: 4000, max: 20000, avg: 11000 }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image or video file');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'];
      if (!validTypes.includes(droppedFile.type)) {
        toast.error('Please select a valid image or video file');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const generateProduct = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setGeneratedProduct(null);

    try {
      // Get Kenyan market pricing for the selected category
      const marketPricing = category ? kenyanMarketPricing[category] : null;
      const pricingContext = marketPricing 
        ? `Price this item appropriately for the Kenyan market. Based on current market analysis, ${category} items typically range from KES ${marketPricing.min.toLocaleString()} to KES ${marketPricing.max.toLocaleString()}, with an average of KES ${marketPricing.avg.toLocaleString()}. Consider the quality, complexity, and current market trends.`
        : 'Price this item appropriately for the Kenyan fashion market, considering current economic conditions, quality, and market demand.';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('additionalContext', additionalContext);
      formData.append('category', category);
      formData.append('priceRange', priceRange);
      formData.append('marketContext', pricingContext);
      formData.append('kenyanMarket', 'true');

      const response = await fetch('http://localhost:5010/api/ai/generate-product', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedProduct(data.product);
        toast.success('Product details generated with Kenyan market pricing!');
        setShowPreview(true);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate product details');
      }
    } catch (error) {
      console.error('Error generating product:', error);
      toast.error('Failed to generate product details');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setGeneratedProduct(null);
    setAdditionalContext('');
    setCategory('');
    setPriceRange('');
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveProduct = async () => {
    if (!generatedProduct) return;

    try {
      const formData = new FormData();
      formData.append('name', generatedProduct.name);
      formData.append('description', generatedProduct.description);
      formData.append('category', generatedProduct.category || '');
      formData.append('price', parseInt(generatedProduct.price));
      formData.append('stock', 10);
      formData.append('slug', generatedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

      // Optional fields – stringify arrays where necessary
      if (generatedProduct.tags?.length) formData.append('tags', generatedProduct.tags.join(','));
      if (generatedProduct.sizes?.length) formData.append('sizes', generatedProduct.sizes.join(','));
      
      // Format colors properly - convert simple strings to objects if needed
      if (generatedProduct.colors?.length) {
        const formattedColors = generatedProduct.colors.map(color => {
          if (typeof color === 'string') {
            // Convert string to object format expected by frontend
            return {
              name: color,
              value: color.toLowerCase().replace(/\s+/g, '-'),
              hex: getColorHex(color) // Helper function to get hex values
            };
          }
          return color;
        });
        formData.append('colors', JSON.stringify(formattedColors));
      }

      // Add other AI-generated fields
      if (generatedProduct.fabric) formData.append('fabric', generatedProduct.fabric);
      if (generatedProduct.care_instructions) formData.append('careInstructions', generatedProduct.care_instructions);
      if (generatedProduct.styling_tips) formData.append('stylingTips', generatedProduct.styling_tips);
      if (generatedProduct.occasion) formData.append('occasion', generatedProduct.occasion);
      if (generatedProduct.cultural_significance) formData.append('culturalSignificance', generatedProduct.cultural_significance);
      if (generatedProduct.features?.length) formData.append('features', generatedProduct.features.join(','));

      // Attach the original file so the saved product has media
      if (file) {
        if (file.type.startsWith('image/')) {
          // Backend expects 'images' field for multer.fields configuration
          formData.append('images', file);
        } else if (file.type.startsWith('video/')) {
          // Backend expects 'video' field for multer.fields configuration
          formData.append('video', file);
        }
      }

      const response = await fetch('http://localhost:5010/api/admin/products', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Product saved successfully!');
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  // Helper function to get color hex values
  const getColorHex = (colorName) => {
    const colorMap = {
      'red': '#DC2626',
      'blue': '#2563EB',
      'green': '#059669',
      'yellow': '#D97706',
      'purple': '#7C3AED',
      'pink': '#DB2777',
      'orange': '#EA580C',
      'black': '#000000',
      'white': '#FFFFFF',
      'gray': '#6B7280',
      'brown': '#92400E',
      'gold': '#D97706',
      'silver': '#9CA3AF'
    };
    
    const normalizedColor = colorName.toLowerCase().trim();
    return colorMap[normalizedColor] || '#6B7280'; // Default to gray if color not found
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SparklesIcon className="h-12 w-12 text-gold-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Product Generator</h1>
          <p className="text-gray-600">
            Upload an image or video of your fashion item and let AI generate complete product details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Media</h2>
            
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-gold-500 bg-gold-50' : 'border-gray-300 hover:border-gold-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {preview ? (
                <div className="space-y-4">
                  {file.type.startsWith('image/') ? (
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  ) : (
                    <video src={preview} controls className="max-h-64 mx-auto rounded-lg" />
                  )}
                  <div className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your file here</p>
                    <p className="text-gray-600">or click to browse</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports: JPG, PNG, WebP, MP4, AVI, MOV (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Additional Context */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Any additional details about the product, fabric, style, etc."
              />
            </div>

            {/* Category Selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Auto-detect</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (Optional)
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Market appropriate</option>
                {priceRanges.map((range) => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateProduct}
              disabled={!file || loading}
              className="w-full mt-6 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Generate Product Details
                </>
              )}
            </button>
          </div>

          {/* Generated Product Preview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Product</h2>
            
            {generatedProduct ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 rounded-lg p-6 space-y-4"
              >
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={generatedProduct.name}
                    onChange={(e) => setGeneratedProduct({...generatedProduct, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={generatedProduct.category}
                    onChange={(e) => setGeneratedProduct({...generatedProduct, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                  <input
                    type="number"
                    value={generatedProduct.price}
                    onChange={(e) => setGeneratedProduct({...generatedProduct, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={generatedProduct.description}
                    onChange={(e) => setGeneratedProduct({...generatedProduct, description: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
                  <input
                    type="text"
                    value={Array.isArray(generatedProduct.colors) ? generatedProduct.colors.join(', ') : generatedProduct.colors}
                    onChange={(e) => setGeneratedProduct({...generatedProduct, colors: e.target.value.split(', ').filter(c => c.trim())})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="Red, Blue, Green"
                  />
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
                  <input
                    type="text"
                    value={Array.isArray(generatedProduct.sizes) ? generatedProduct.sizes.join(', ') : generatedProduct.sizes}
                    onChange={(e) => setGeneratedProduct({...generatedProduct, sizes: e.target.value.split(', ').filter(s => s.trim())})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="XS, S, M, L, XL"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveProduct}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Product
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                {/* Additional Details Toggle */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    {showPreview ? 'Hide' : 'Show'} Additional Details
                  </button>
                </div>

                {/* Additional Details */}
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                      <input
                        type="text"
                        value={generatedProduct.fabric}
                        onChange={(e) => setGeneratedProduct({...generatedProduct, fabric: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                      <textarea
                        value={generatedProduct.care_instructions}
                        onChange={(e) => setGeneratedProduct({...generatedProduct, care_instructions: e.target.value})}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Styling Tips</label>
                      <textarea
                        value={generatedProduct.styling_tips}
                        onChange={(e) => setGeneratedProduct({...generatedProduct, styling_tips: e.target.value})}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                      <input
                        type="text"
                        value={generatedProduct.occasion}
                        onChange={(e) => setGeneratedProduct({...generatedProduct, occasion: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={Array.isArray(generatedProduct.tags) ? generatedProduct.tags.join(', ') : generatedProduct.tags}
                        onChange={(e) => setGeneratedProduct({...generatedProduct, tags: e.target.value.split(', ').filter(t => t.trim())})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="african fashion, ankara, traditional"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Upload an image or video to generate product details
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIProductGenerator; 