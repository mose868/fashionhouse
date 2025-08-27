import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShare, 
  FaCopy, 
  FaCheck, 
  FaDollarSign, 
  FaUsers, 
  FaChartLine, 
  FaTrophy,
  FaEye,
  FaShoppingBag
} from 'react-icons/fa';

const AmbassadorDashboard = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('ambassadorToken');
      if (!token) {
        setError('Please log in to view your dashboard');
        setLoading(false);
        return;
      }

      // Fetch ambassador profile and dashboard data
      const [profileResponse, dashboardResponse] = await Promise.all([
        fetch('/api/ambassadors/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/ambassadors/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (profileResponse.ok && dashboardResponse.ok) {
        const profileData = await profileResponse.json();
        const dashboardData = await dashboardResponse.json();
        
        setAmbassador(profileData.ambassador);
        setReferralStats(dashboardData);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (ambassador && ambassador.referralCode) {
      const referralLink = `${window.location.origin}/ref/${ambassador.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierColor = (tier) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-500';
      case 'gold': return 'text-yellow-500';
      case 'diamond': return 'text-blue-500';
      default: return 'text-purple-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!ambassador || ambassador.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ambassador Status</h2>
          <p className="text-gray-600 mb-4">
            {ambassador?.status === 'pending' 
              ? 'Your application is under review. You will receive an email once approved.'
              : 'Your ambassador application was not approved or is no longer active.'
            }
          </p>
          <a 
            href="/ambassador"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Application
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, {ambassador.firstName}! 👋
                </h1>
                <p className="text-purple-100 mt-2">
                  Tier: <span className={`font-semibold ${getTierColor(ambassador.tier)}`}>
                    {ambassador.tier} Ambassador
                  </span>
                </p>
                <p className="text-purple-100">
                  Commission Rate: {(ambassador.commissionRate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(ambassador.totalEarnings)}
                </div>
                <div className="text-purple-100">Total Earnings</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaShare className="mr-2 text-purple-600" />
            Your Referral Link
          </h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={`${window.location.origin}/ref/${ambassador.referralCode}`}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {copied ? (
                  <>
                    <FaCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-purple-600 mt-2">
              Share this link to earn {(ambassador.commissionRate * 100).toFixed(0)}% commission on every sale!
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {referralStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaEye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Visits</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {referralStats.totalVisits || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaUsers className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Referrals</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {referralStats.totalReferrals || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {referralStats.totalOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaDollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(referralStats.monthlyEarnings)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance and Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-500" />
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Conversion Rate</span>
                  <span>{((referralStats?.conversionRate || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(referralStats?.conversionRate || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Next Tier Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Tips to Increase Earnings
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Share your link on social media platforms
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Create fashion content featuring our products
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Engage with your audience authentically
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Join our monthly ambassador challenges
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorDashboard; 