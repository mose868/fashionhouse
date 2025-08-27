import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, ShareIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AdminMarketing = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Campaign Generator
  const [campaignData, setCampaignData] = useState({
    objective: '',
    targetAudience: '',
    product: '',
    duration: '',
    budget: '',
    platform: ''
  });

  // Social Media Calendar
  const [calendarData, setCalendarData] = useState({
    platform: 'instagram',
    duration: '1 week',
    theme: '',
    goals: '',
    audience: ''
  });

  // Email Templates
  const [emailData, setEmailData] = useState({
    type: '',
    purpose: '',
    audience: '',
    message: '',
    callToAction: ''
  });

  // Website Content
  const [contentData, setContentData] = useState({
    pageType: '',
    purpose: '',
    keywords: '',
    tone: '',
    wordCount: ''
  });

  // Handle input changes
  const handleInputChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  // Generate marketing campaign
  const generateCampaign = async () => {
    if (!campaignData.objective || !campaignData.targetAudience) {
      toast.error('Please fill in objective and target audience');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5010/api/ai/generate-campaign', campaignData);
      
      if (response.data.success) {
        setGeneratedContent({
          type: 'campaign',
          data: response.data.campaign
        });
        toast.success('Marketing campaign generated successfully!');
      }
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast.error('Failed to generate marketing campaign');
    } finally {
      setLoading(false);
    }
  };

  // Generate social media calendar
  const generateSocialCalendar = async () => {
    if (!calendarData.platform || !calendarData.duration) {
      toast.error('Please fill in platform and duration');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5010/api/ai/generate-social-calendar', calendarData);
      
      if (response.data.success) {
        setGeneratedContent({
          type: 'calendar',
          data: response.data.calendar
        });
        toast.success('Social media calendar generated successfully!');
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
      toast.error('Failed to generate social media calendar');
    } finally {
      setLoading(false);
    }
  };

  // Generate email template
  const generateEmailTemplate = async () => {
    if (!emailData.type || !emailData.purpose) {
      toast.error('Please fill in email type and purpose');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5010/api/ai/generate-email-templates', emailData);
      
      if (response.data.success) {
        setGeneratedContent({
          type: 'email',
          data: response.data.template
        });
        toast.success('Email template generated successfully!');
      }
    } catch (error) {
      console.error('Error generating email template:', error);
      toast.error('Failed to generate email template');
    } finally {
      setLoading(false);
    }
  };

  // Generate website content
  const generateWebContent = async () => {
    if (!contentData.pageType || !contentData.purpose) {
      toast.error('Please fill in page type and purpose');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5010/api/ai/generate-web-content', contentData);
      
      if (response.data.success) {
        setGeneratedContent({
          type: 'content',
          data: response.data.content
        });
        toast.success('Website content generated successfully!');
      }
    } catch (error) {
      console.error('Error generating web content:', error);
      toast.error('Failed to generate website content');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const tabs = [
    { id: 'email', name: 'Email Templates', icon: EnvelopeIcon },
    { id: 'social', name: 'Social Media', icon: ShareIcon },
    { id: 'newsletter', name: 'Newsletter Subscribers', icon: UserGroupIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ];

  // Fetch newsletter subscribers
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const response = await fetch('/api/newsletter/subscribers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.data || []);
      } else {
        toast.error('Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to fetch subscribers');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'newsletter') {
      fetchSubscribers();
    }
  }, [activeTab]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Marketing Suite</h1>
          <p className="text-gray-600">Generate comprehensive marketing content and campaigns with AI</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Email Templates Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Email Template</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Type *</label>
                      <select
                        name="type"
                        value={emailData.type}
                        onChange={handleInputChange(setEmailData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="promotional">Promotional</option>
                        <option value="welcome">Welcome Email</option>
                        <option value="abandoned-cart">Abandoned Cart</option>
                        <option value="order-confirmation">Order Confirmation</option>
                        <option value="customer-service">Customer Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
                      <input
                        type="text"
                        name="purpose"
                        value={emailData.purpose}
                        onChange={handleInputChange(setEmailData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Announce new collection, Thank customers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <input
                        type="text"
                        name="audience"
                        value={emailData.audience}
                        onChange={handleInputChange(setEmailData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Existing customers, New subscribers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Key Message</label>
                      <input
                        type="text"
                        name="message"
                        value={emailData.message}
                        onChange={handleInputChange(setEmailData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Exclusive offer for loyal customers"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                      <input
                        type="text"
                        name="callToAction"
                        value={emailData.callToAction}
                        onChange={handleInputChange(setEmailData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Shop Now, Learn More, Contact Us"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateEmailTemplate}
                    disabled={loading}
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
                        Generate Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Social Media Calendar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                      <select
                        name="platform"
                        value={calendarData.platform}
                        onChange={handleInputChange(setCalendarData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                      <select
                        name="duration"
                        value={calendarData.duration}
                        onChange={handleInputChange(setCalendarData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1 week">1 Week</option>
                        <option value="2 weeks">2 Weeks</option>
                        <option value="1 month">1 Month</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <input
                        type="text"
                        name="theme"
                        value={calendarData.theme}
                        onChange={handleInputChange(setCalendarData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., African Fashion Week, Summer Collection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                      <input
                        type="text"
                        name="goals"
                        value={calendarData.goals}
                        onChange={handleInputChange(setCalendarData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Increase engagement, Drive traffic"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <input
                        type="text"
                        name="audience"
                        value={calendarData.audience}
                        onChange={handleInputChange(setCalendarData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Fashion-conscious women interested in African fashion"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateSocialCalendar}
                    disabled={loading}
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
                        Generate Calendar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Newsletter Subscribers Tab */}
            {activeTab === 'newsletter' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Newsletter Subscribers</h2>
                  <button
                    onClick={fetchSubscribers}
                    disabled={loadingSubscribers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingSubscribers ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Total Subscribers: {subscribers.length}
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subscribed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {subscriber.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                subscriber.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : subscriber.status === 'unsubscribed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {subscriber.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {subscriber.source}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(subscriber.subscribedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(subscriber.email);
                                  toast.success('Email copied to clipboard');
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Copy Email
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {subscribers.length === 0 && !loadingSubscribers && (
                    <div className="text-center py-8 text-gray-500">
                      No subscribers found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Website Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Website Content</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Type *</label>
                      <select
                        name="pageType"
                        value={contentData.pageType}
                        onChange={handleInputChange(setContentData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Page Type</option>
                        <option value="homepage">Homepage</option>
                        <option value="about">About Us</option>
                        <option value="product-page">Product Page</option>
                        <option value="category-page">Category Page</option>
                        <option value="landing-page">Landing Page</option>
                        <option value="blog-post">Blog Post</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
                      <input
                        type="text"
                        name="purpose"
                        value={contentData.purpose}
                        onChange={handleInputChange(setContentData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Showcase African fashion, Drive conversions"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                      <input
                        type="text"
                        name="keywords"
                        value={contentData.keywords}
                        onChange={handleInputChange(setContentData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., african fashion, traditional wear, kenya fashion"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Word Count</label>
                      <select
                        name="wordCount"
                        value={contentData.wordCount}
                        onChange={handleInputChange(setContentData)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Word Count</option>
                        <option value="100-300">100-300 words</option>
                        <option value="300-500">300-500 words</option>
                        <option value="500-800">500-800 words</option>
                        <option value="800+">800+ words</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={generateWebContent}
                    disabled={loading}
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
              </div>
            )}
          </div>
        </div>

        {/* Generated Content Display */}
        {generatedContent && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Generated {generatedContent.type === 'campaign' ? 'Campaign' : 
                          generatedContent.type === 'calendar' ? 'Social Media Calendar' :
                          generatedContent.type === 'email' ? 'Email Template' : 'Website Content'}
              </h2>
              <button
                onClick={() => copyToClipboard(generatedContent.data)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 overflow-x-auto">
                {typeof generatedContent.data === 'object' 
                  ? JSON.stringify(generatedContent.data, null, 2)
                  : generatedContent.data
                }
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarketing; 