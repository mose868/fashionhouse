import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRuler, FaUser, FaCalendarAlt, FaPalette, FaCloudUploadAlt } from 'react-icons/fa';

const CustomTailoringModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    measurements: {
      height: '',
      bust: '',
      waist: '',
      hips: '',
      sleeveLength: '',
      shoulderWidth: '',
      armLength: '',
      notes: ''
    },
    fabricPreference: 'Kitenge',
    fabricDetails: '',
    styleConfig: {
      sleeveType: 'Long',
      collarType: 'V-Neck',
      length: 'Midi',
      pattern: 'Kitenge',
      fit: 'Tailored Fit'
    },
    specialInstructions: '',
    occasionType: 'Casual Wear',
    occasionDate: '',
    urgencyLevel: 'Standard',
    referenceImages: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      referenceImages: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic info
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('customerEmail', formData.customerEmail);
      formDataToSend.append('customerPhone', formData.customerPhone);
      formDataToSend.append('productId', product?._id || '');
      formDataToSend.append('productName', product?.name || formData.productName);
      formDataToSend.append('basePrice', product?.price || 0);
      
      // Add complex objects as JSON strings
      formDataToSend.append('measurements', JSON.stringify(formData.measurements));
      formDataToSend.append('styleConfig', JSON.stringify(formData.styleConfig));
      
      // Add other fields
      formDataToSend.append('fabricPreference', formData.fabricPreference);
      formDataToSend.append('fabricDetails', formData.fabricDetails);
      formDataToSend.append('specialInstructions', formData.specialInstructions);
      formDataToSend.append('occasionType', formData.occasionType);
      formDataToSend.append('occasionDate', formData.occasionDate);
      formDataToSend.append('urgencyLevel', formData.urgencyLevel);

      // Add reference images
      formData.referenceImages.forEach((file, index) => {
        formDataToSend.append('referenceImages', file);
      });

      const response = await fetch('/api/custom-tailoring', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        alert('Custom tailoring request submitted successfully! We will contact you within 24 hours.');
        onClose();
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          measurements: {
            height: '',
            bust: '',
            waist: '',
            hips: '',
            sleeveLength: '',
            shoulderWidth: '',
            armLength: '',
            notes: ''
          },
          fabricPreference: 'Kitenge',
          fabricDetails: '',
          styleConfig: {
            sleeveType: 'Long',
            collarType: 'V-Neck',
            length: 'Midi',
            pattern: 'Kitenge',
            fit: 'Tailored Fit'
          },
          specialInstructions: '',
          occasionType: 'Casual Wear',
          occasionDate: '',
          urgencyLevel: 'Standard',
          referenceImages: []
        });
        setCurrentStep(1);
      } else {
        alert('Error submitting request: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting custom tailoring request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FaUser className="text-4xl text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <p className="text-gray-600">Let us know how to reach you</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="+254..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion Type
                </label>
                <select
                  name="occasionType"
                  value={formData.occasionType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Traditional Ceremony">Traditional Ceremony</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Casual Wear">Casual Wear</option>
                  <option value="Party">Party</option>
                  <option value="Religious Ceremony">Religious Ceremony</option>
                  <option value="Cultural Festival">Cultural Festival</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion Date
                </label>
                <input
                  type="date"
                  name="occasionDate"
                  value={formData.occasionDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Standard">Standard (2-3 weeks)</option>
                  <option value="Rush">Rush (1-2 weeks) - 50% extra</option>
                  <option value="Emergency">Emergency (3-7 days) - 100% extra</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FaRuler className="text-4xl text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Measurements</h3>
              <p className="text-gray-600">Provide accurate measurements for perfect fit</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height *
                </label>
                <input
                  type="text"
                  name="measurements.height"
                  value={formData.measurements.height}
                  onChange={handleInputChange}
                  placeholder="e.g., 5'6\" or 168cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bust/Chest *
                </label>
                <input
                  type="text"
                  name="measurements.bust"
                  value={formData.measurements.bust}
                  onChange={handleInputChange}
                  placeholder="e.g., 36\" or 91cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waist *
                </label>
                <input
                  type="text"
                  name="measurements.waist"
                  value={formData.measurements.waist}
                  onChange={handleInputChange}
                  placeholder="e.g., 28\" or 71cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hips *
                </label>
                <input
                  type="text"
                  name="measurements.hips"
                  value={formData.measurements.hips}
                  onChange={handleInputChange}
                  placeholder="e.g., 38\" or 97cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleeve Length *
                </label>
                <input
                  type="text"
                  name="measurements.sleeveLength"
                  value={formData.measurements.sleeveLength}
                  onChange={handleInputChange}
                  placeholder="e.g., 24\" or 61cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shoulder Width
                </label>
                <input
                  type="text"
                  name="measurements.shoulderWidth"
                  value={formData.measurements.shoulderWidth}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Measurement Notes
              </label>
              <textarea
                name="measurements.notes"
                value={formData.measurements.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any specific fit preferences or additional measurements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FaPalette className="text-4xl text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Style Preferences</h3>
              <p className="text-gray-600">Customize your design preferences</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabric Preference *
                </label>
                <select
                  name="fabricPreference"
                  value={formData.fabricPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Kente">Kente</option>
                  <option value="Kitenge">Kitenge</option>
                  <option value="Ankara">Ankara</option>
                  <option value="Dashiki">Dashiki</option>
                  <option value="Maasai">Maasai</option>
                  <option value="Bogolan">Bogolan</option>
                  <option value="Adinkra">Adinkra</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Linen">Linen</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleeve Type
                </label>
                <select
                  name="styleConfig.sleeveType"
                  value={formData.styleConfig.sleeveType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Short">Short</option>
                  <option value="Long">Long</option>
                  <option value="3/4 Length">3/4 Length</option>
                  <option value="Sleeveless">Sleeveless</option>
                  <option value="Bell">Bell</option>
                  <option value="Puff">Puff</option>
                  <option value="Bishop">Bishop</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collar Type
                </label>
                <select
                  name="styleConfig.collarType"
                  value={formData.styleConfig.collarType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="V-Neck">V-Neck</option>
                  <option value="Round Neck">Round Neck</option>
                  <option value="High Neck">High Neck</option>
                  <option value="Off-Shoulder">Off-Shoulder</option>
                  <option value="Boat Neck">Boat Neck</option>
                  <option value="Square Neck">Square Neck</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <select
                  name="styleConfig.length"
                  value={formData.styleConfig.length}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Mini">Mini</option>
                  <option value="Knee-Length">Knee-Length</option>
                  <option value="Midi">Midi</option>
                  <option value="Maxi">Maxi</option>
                  <option value="Floor-Length">Floor-Length</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fit Style
                </label>
                <select
                  name="styleConfig.fit"
                  value={formData.styleConfig.fit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Slim Fit">Slim Fit</option>
                  <option value="Regular Fit">Regular Fit</option>
                  <option value="Loose Fit">Loose Fit</option>
                  <option value="Tailored Fit">Tailored Fit</option>
                  <option value="A-Line">A-Line</option>
                  <option value="Straight Cut">Straight Cut</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern Style
                </label>
                <select
                  name="styleConfig.pattern"
                  value={formData.styleConfig.pattern}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Kente">Kente</option>
                  <option value="Kitenge">Kitenge</option>
                  <option value="Ankara">Ankara</option>
                  <option value="Geometric">Geometric</option>
                  <option value="Floral">Floral</option>
                  <option value="Abstract">Abstract</option>
                  <option value="Solid">Solid</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Details & Color Preferences
              </label>
              <textarea
                name="fabricDetails"
                value={formData.fabricDetails}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe your preferred colors, patterns, or specific fabric details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FaCloudUploadAlt className="text-4xl text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Final Details</h3>
              <p className="text-gray-600">Add any special instructions and reference images</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any special requests, modifications, or additional details we should know about..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FaCloudUploadAlt className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload reference images to help us understand your vision</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="reference-images"
                />
                <label
                  htmlFor="reference-images"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Choose Images
                </label>
                {formData.referenceImages.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.referenceImages.length} image(s) selected
                  </p>
                )}
              </div>
            </div>

            {product && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Product Information</h4>
                <p><strong>Product:</strong> {product.name}</p>
                <p><strong>Base Price:</strong> KES {product.price?.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Final price will be calculated based on your customizations and urgency level.
                  We'll provide a detailed quote within 24 hours.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Get Custom Tailored</h2>
                <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomTailoringModal; 