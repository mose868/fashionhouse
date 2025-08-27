import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMagic, 
  FaRobot, 
  FaChartLine,
  FaEdit,
  FaShareAlt,
  FaBlog,
  FaImage,
  FaDollarSign,
  FaUsers,
  FaClock
} from 'react-icons/fa';
import AIProductGenerator from '../../components/admin/AIProductGenerator';
import AIMediaUploader from '../../components/admin/AIMediaUploader';
import axios from 'axios';

const AdminAI = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [analytics, setAnalytics] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
    fetchUsageData();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5010/api/ai/analytics');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/admin/ai-usage');
      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError('Failed to fetch AI usage data');
    }
  };

  const aiFeatures = [
    {
      title: "Fashion Assistant Chat",
      description: "AI-powered customer service and styling advice",
      icon: <FaRobot className="text-2xl text-purple-600" />,
      stats: analytics ? `${analytics.chat_requests} conversations` : "Loading...",
      color: "purple"
    },
    {
      title: "Product Descriptions",
      description: "Auto-generate compelling product descriptions",
      icon: <FaEdit className="text-2xl text-blue-600" />,
      stats: analytics ? `${analytics.description_generations} generated` : "Loading...",
      color: "blue"
    },
    {
      title: "Marketing Content",
      description: "Social media posts, emails, and ad copy",
      icon: <FaShareAlt className="text-2xl text-green-600" />,
      stats: analytics ? `${analytics.marketing_content} pieces created` : "Loading...",
      color: "green"
    },
    {
      title: "Blog Generation",
      description: "SEO-optimized fashion blog posts",
      icon: <FaBlog className="text-2xl text-orange-600" />,
      stats: analytics ? `${analytics.blog_generations} articles` : "Loading...",
      color: "orange"
    },
    {
      title: "Style Recommendations",
      description: "Personalized outfit suggestions for customers",
      icon: <FaMagic className="text-2xl text-pink-600" />,
      stats: analytics ? `${analytics.recommendations} recommendations` : "Loading...",
      color: "pink"
    },
    {
      title: "Image Analysis",
      description: "Analyze fashion items from customer photos",
      icon: <FaImage className="text-2xl text-indigo-600" />,
      stats: analytics ? `${analytics.image_analyses} analyses` : "Loading...",
      color: "indigo"
    }
  ];

  const usageStats = [
    {
      title: "Total Requests",
      value: analytics?.total_requests || 0,
      icon: <FaChartLine className="text-blue-600" />,
      change: "+15%",
      changeType: "increase"
    },
    {
      title: "Active Users",
      value: analytics?.active_users || 0,
      icon: <FaUsers className="text-green-600" />,
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Tokens Used",
      value: analytics?.total_tokens_used || 0,
      icon: <FaClock className="text-purple-600" />,
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Cost (USD)",
      value: `$${analytics?.cost_estimate || 0}`,
      icon: <FaDollarSign className="text-orange-600" />,
      change: "+10%",
      changeType: "increase"
    }
  ];

  const tabs = [
    { id: 'generator', label: 'AI Generator', icon: <FaMagic /> },
    { id: 'uploader', label: 'Media Upload', icon: <FaImage /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <FaRobot className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Management</h1>
            <p className="text-gray-600">Manage your AI-powered content generation and analytics</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-800 font-medium">OpenAI Integration Active</span>
            <span className="text-green-600 text-sm">• GPT-4 Powered • Real-time Processing</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-2 px-6 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'generator' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AIProductGenerator />
        </motion.div>
      )}

      {activeTab === 'uploader' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AIMediaUploader />
        </motion.div>
      )}

      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Usage Stats */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {usageStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {stat.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Features Overview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Features Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-${feature.color}-50 rounded-lg`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                      <div className={`text-${feature.color}-600 font-medium text-sm`}>
                        {feature.stats}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Analysis</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${analytics?.cost_estimate || 0}
                  </div>
                  <p className="text-gray-600">This Month</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${1000 - (analytics?.cost_estimate || 0)}
                  </div>
                  <p className="text-gray-600">Remaining Credits</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics?.total_tokens_used?.toLocaleString() || 0}
                  </div>
                  <p className="text-gray-600">Tokens Used</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Budget Progress</span>
                  <span className="text-sm text-gray-500">
                    {((analytics?.cost_estimate || 0) / 1000 * 100).toFixed(1)}% used
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((analytics?.cost_estimate || 0) / 1000 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Tips</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Cost Optimization</h3>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li>• Use shorter prompts when possible</li>
                    <li>• Cache frequently generated content</li>
                    <li>• Monitor peak usage times</li>
                    <li>• Set monthly spending limits</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-3">Performance Tips</h3>
                  <ul className="space-y-2 text-purple-800 text-sm">
                    <li>• Provide specific product details</li>
                    <li>• Use consistent tone guidelines</li>
                    <li>• Train AI with your brand voice</li>
                    <li>• A/B test generated content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminAI; 