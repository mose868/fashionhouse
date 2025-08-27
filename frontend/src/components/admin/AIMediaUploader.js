import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaImage, 
  FaVideo,
  FaSpinner, 
  FaMagic,
  FaCopy,
  FaCheck,
  FaTrash,
  FaEye,
  FaDollarSign,
  FaShareAlt,
  FaRobot,
  FaDownload,
  FaSave
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const AIMediaUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [saveToDatabase, setSaveToDatabase] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length !== fileArray.length) {
      toast.error('Only image and video files are allowed');
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('media', file);
        
        const response = await axios.post('http://localhost:5010/api/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setUploadedFiles(prev => [...prev, {
            ...response.data.file,
            uploadDate: new Date().toISOString()
          }]);
        }
      }
      
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeWithAI = async (file) => {
    setIsAnalyzing(true);
    setSelectedFile(file);
    
    try {
      const formData = new FormData();
      
      // Create a file blob from URL for re-upload with analysis
      const response = await fetch(file.url);
      const blob = await response.blob();
      const fileObj = new File([blob], file.originalName, { type: file.mimetype });
      
      formData.append('media', fileObj);
      formData.append('context', additionalContext);
      formData.append('saveToDatabase', saveToDatabase.toString());

      const analysisResponse = await axios.post('http://localhost:5010/api/upload/create-product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (analysisResponse.data.success) {
        setAnalysisResult(analysisResponse.data);
        
        // Show appropriate success message
        if (analysisResponse.data.savedProduct) {
          toast.success('AI analysis completed and product saved to database! 🎉');
        } else {
          toast.success('AI analysis completed successfully!');
        }
      } else {
        throw new Error(analysisResponse.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze media with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (text, itemKey) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [itemKey]: true }));
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [itemKey]: false }));
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const deleteFile = async (filename) => {
    try {
      const response = await axios.delete(`http://localhost:5010/api/upload/delete/${filename}`);
      if (response.data.success) {
        setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
        if (selectedFile?.filename === filename) {
          setSelectedFile(null);
          setAnalysisResult(null);
        }
        toast.success('File deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const saveProduct = () => {
    if (analysisResult) {
      // Here you would typically save to your products database
      toast.success('Product saved successfully! (Implementation needed)');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <FaRobot className="text-3xl" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Media Upload</h2>
            <p className="opacity-90">Upload images/videos and let AI create products automatically</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaImage className="text-yellow-300" />
            <span>Auto Product Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-green-300" />
            <span>Smart Pricing Suggestions</span>
          </div>
          <div className="flex items-center gap-2">
            <FaShareAlt className="text-blue-300" />
            <span>Social Media Content</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Drag & Drop Upload */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <motion.div
              animate={{ scale: dragOver ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your media files here
              </h3>
              <p className="text-gray-600 mb-4">
                Or click to browse (Images & Videos supported)
              </p>
              
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                {isUploading ? 'Uploading...' : 'Select Files'}
              </motion.button>
            </motion.div>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add context about the fashion item (e.g., 'Traditional wedding dress', 'Casual summer wear')..."
            />
          </div>

          {/* Save to Database Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToDatabase}
                onChange={(e) => setSaveToDatabase(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="text-sm font-medium text-blue-900">
                  💾 Save to Products Database
                </span>
                <p className="text-xs text-blue-700 mt-1">
                  Automatically save AI-generated products to your database as drafts
                </p>
              </div>
            </label>
          </div>

          {/* Uploaded Files */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={file.filename}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${
                    selectedFile?.filename === file.filename 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {file.mimetype.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FaVideo className="text-gray-500 text-xl" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.mimetype}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => analyzeWithAI(file)}
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Analyze with AI"
                      >
                        {isAnalyzing && selectedFile?.filename === file.filename ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaMagic />
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => window.open(file.url, '_blank')}
                        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="View file"
                      >
                        <FaEye />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => deleteFile(file.filename)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Delete file"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {uploadedFiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaImage className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaRobot className="text-purple-600" />
                AI Analysis Results
              </h3>
            </div>
            
            <div className="p-6">
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing media with AI...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  {/* AI Analysis */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FaEye className="text-blue-600" />
                        Product Analysis
                      </h4>
                      <button
                        onClick={() => copyToClipboard(analysisResult.aiAnalysis, 'analysis')}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        {copiedItems.analysis ? <FaCheck className="text-green-600" /> : <FaCopy />}
                        {copiedItems.analysis ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">{analysisResult.aiAnalysis}</pre>
                    </div>
                  </div>

                  {/* Pricing Suggestions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FaDollarSign className="text-green-600" />
                        Pricing Suggestions
                      </h4>
                      <button
                        onClick={() => copyToClipboard(analysisResult.pricingSuggestion, 'pricing')}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        {copiedItems.pricing ? <FaCheck className="text-green-600" /> : <FaCopy />}
                        {copiedItems.pricing ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-800 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">{analysisResult.pricingSuggestion}</pre>
                    </div>
                  </div>

                  {/* Social Media Package */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FaShareAlt className="text-purple-600" />
                        Social Media Package
                      </h4>
                      <button
                        onClick={() => copyToClipboard(analysisResult.socialMediaPackage, 'social')}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        {copiedItems.social ? <FaCheck className="text-green-600" /> : <FaCopy />}
                        {copiedItems.social ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-800 max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">{analysisResult.socialMediaPackage}</pre>
                    </div>
                  </div>

                  {/* Tokens Used */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">AI Usage</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Total Tokens:</span>
                        <span className="font-semibold ml-2">{analysisResult.tokensUsed?.total || 0}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Est. Cost:</span>
                        <span className="font-semibold ml-2">
                          ${((analysisResult.tokensUsed?.total || 0) * 0.00002).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Saved Product Info */}
                  {analysisResult.savedProduct && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <FaCheck className="text-green-600" />
                        Product Saved Successfully! 🎉
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-green-700">Product ID:</span>
                          <span className="font-mono ml-2 text-green-900">{analysisResult.savedProduct.id}</span>
                        </div>
                        <div>
                          <span className="text-green-700">SKU:</span>
                          <span className="font-mono ml-2 text-green-900">{analysisResult.savedProduct.sku}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Status:</span>
                          <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Draft</span>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 mt-3">
                        💡 Your product has been saved as a draft. You can edit and publish it from the Products dashboard.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      onClick={saveProduct}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-blue-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaSave />
                      Save Product
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        const content = `AI Analysis:\n${analysisResult.aiAnalysis}\n\nPricing:\n${analysisResult.pricingSuggestion}\n\nSocial Media:\n${analysisResult.socialMediaPackage}`;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `product-analysis-${Date.now()}.txt`;
                        a.click();
                      }}
                      className="bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaDownload />
                      Export
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaMagic className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Upload a file and click "Analyze with AI" to see results</p>
                  <p className="text-sm mt-2">AI will generate product details, pricing, and marketing content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMediaUploader; 