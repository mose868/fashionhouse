import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AIDashboard = ({ onContentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('quick-actions');
  const [generatedContent, setGeneratedContent] = useState(null);

  // Quick Actions
  const [quickAction, setQuickAction] = useState({
    type: '',
    prompt: '',
    context: ''
  });

  // Content Generator
  const [contentData, setContentData] = useState({
    contentType: '',
    topic: '',
    targetAudience: '',
    tone: '',
    length: ''
  });

  // Handle input changes
  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  // Generate quick content
  const generateQuickContent = async () => {
    if (!quickAction.type || !quickAction.prompt) {
      toast.error('Please select a type and enter a prompt');
      return;
    }

    try {
      setLoading(true);
      let endpoint = '';
      let data = {};

      switch (quickAction.type) {
        case 'blog':
          endpoint = 'http://localhost:5010/api/ai/generate-comprehensive-blog';
          data = {
            topic: quickAction.prompt,
            targetAudience: 'Fashion-conscious customers interested in African fashion',
            tone: 'Professional yet warm, celebrating African heritage',
            wordCount: '800-1200',
            includeSEO: true,
            includeImages: true
          };
          break;
        case 'marketing':
          endpoint = 'http://localhost:5010/api/ai/generate-marketing';
          data = {
            contentType: 'social_media',
            productInfo: {
              product: quickAction.prompt,
              focus: 'African fashion and culture',
              description: quickAction.context || 'Premium African fashion collection'
            }
          };
          break;
        case 'email':
          endpoint = 'http://localhost:5010/api/ai/generate-email-templates';
          data = {
            type: 'newsletter',
            purpose: quickAction.prompt,
            audience: 'Fashion-conscious customers',
            message: quickAction.context || 'Latest African fashion trends',
            callToAction: 'Shop Now'
          };
          break;
        case 'description':
          endpoint = 'http://localhost:5010/api/ai/generate-description';
          data = {
            name: quickAction.prompt,
            category: 'African Fashion',
            fabric: 'Premium African fabric',
            colors: 'Various colors',
            size: 'Available in all sizes',
            price: 'Premium pricing',
            additionalInfo: quickAction.context || ''
          };
          break;
        default:
          toast.error('Invalid content type');
          return;
      }

      const response = await axios.post(endpoint, data);
      
      if (response.data.success) {
        const content = response.data.content || response.data.campaign || response.data.template || response.data.description;
        setGeneratedContent({
          type: quickAction.type,
          data: content,
          prompt: quickAction.prompt
        });
        toast.success('Content generated successfully!');
        
        if (onContentGenerated) {
          onContentGenerated(content, quickAction.type);
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h2>
        <p className="text-gray-600">Generate content and get AI-powered insights</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveSection('quick-actions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'quick-actions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quick Actions
        </button>
        <button
          onClick={() => setActiveSection('content-generator')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'content-generator'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Content Generator
        </button>
        <button
          onClick={() => setActiveSection('insights')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          AI Insights
        </button>
      </div>

      {/* Quick Actions Section */}
      {activeSection === 'quick-actions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Content Generation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  name="type"
                  value={quickAction.type}
                  onChange={handleInputChange(setQuickAction)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="blog">Blog Post</option>
                  <option value="marketing">Marketing Content</option>
                  <option value="email">Email Template</option>
                  <option value="description">Product Description</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Prompt *</label>
                <input
                  type="text"
                  name="prompt"
                  value={quickAction.prompt}
                  onChange={handleInputChange(setQuickAction)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., African Fashion Trends 2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
              <textarea
                name="context"
                value={quickAction.context}
                onChange={handleInputChange(setQuickAction)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional details or requirements..."
              />
            </div>

            <button
              onClick={generateQuickContent}
              disabled={loading || !quickAction.type || !quickAction.prompt}
              className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Quick Action Templates */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'blog', prompt: 'African Fashion Trends 2024', label: 'Fashion Trends Blog' },
                { type: 'marketing', prompt: 'New Collection Launch', label: 'Collection Launch' },
                { type: 'email', prompt: 'Weekly Newsletter', label: 'Newsletter Template' },
                { type: 'description', prompt: 'Traditional African Dress', label: 'Product Description' }
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setQuickAction(template)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="font-medium text-gray-900">{template.label}</div>
                  <div className="text-sm text-gray-600">{template.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Generator Section */}
      {activeSection === 'content-generator' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Content Generator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  name="contentType"
                  value={contentData.contentType}
                  onChange={handleInputChange(setContentData)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Content Type</option>
                  <option value="blog">Blog Post</option>
                  <option value="social">Social Media Post</option>
                  <option value="email">Email Campaign</option>
                  <option value="product">Product Description</option>
                  <option value="marketing">Marketing Copy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={contentData.topic}
                  onChange={handleInputChange(setContentData)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your topic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={contentData.targetAudience}
                  onChange={handleInputChange(setContentData)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fashion-conscious women 25-40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  name="tone"
                  value={contentData.tone}
                  onChange={handleInputChange(setContentData)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tone</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="luxury">Luxury</option>
                  <option value="friendly">Friendly</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                <select
                  name="length"
                  value={contentData.length}
                  onChange={handleInputChange(setContentData)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Length</option>
                  <option value="short">Short (100-300 words)</option>
                  <option value="medium">Medium (300-800 words)</option>
                  <option value="long">Long (800+ words)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                // This would trigger the advanced content generation
                toast.info('Advanced content generator coming soon!');
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Generate Advanced Content
            </button>
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {activeSection === 'insights' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Content Performance</h4>
                <p className="text-blue-700 text-sm">
                  AI analysis shows blog posts about African fashion trends perform 40% better than general fashion content.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Customer Engagement</h4>
                <p className="text-green-700 text-sm">
                  Social media posts with cultural elements receive 60% more engagement than standard product posts.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Trending Topics</h4>
                <p className="text-purple-700 text-sm">
                  Current trending topics: Sustainable African Fashion, Traditional Wedding Attire, Modern African Design.
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">SEO Opportunities</h4>
                <p className="text-orange-700 text-sm">
                  High-potential keywords: "African fashion Kenya", "Traditional African clothing", "African wedding dress".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated {generatedContent.type === 'blog' ? 'Blog Post' : 
                        generatedContent.type === 'marketing' ? 'Marketing Content' :
                        generatedContent.type === 'email' ? 'Email Template' : 'Product Description'}
            </h3>
            <button
              onClick={() => copyToClipboard(typeof generatedContent.data === 'object' ? JSON.stringify(generatedContent.data, null, 2) : generatedContent.data)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 overflow-x-auto max-h-64 overflow-y-auto">
              {typeof generatedContent.data === 'object' 
                ? JSON.stringify(generatedContent.data, null, 2)
                : generatedContent.data
              }
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDashboard; 