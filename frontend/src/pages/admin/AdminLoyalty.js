import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GiftIcon,
  StarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminLoyalty = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    eligibleCustomers: 0,
    activeLoyaltyCodes: 0,
    totalLoyaltyRewards: 0
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchLoyaltyCustomers();
    fetchLoyaltyStats();
  }, [currentPage]);

  const fetchLoyaltyCustomers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5010/api/admin/loyalty/customers?page=${currentPage}&limit=20`);

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setTotalPages(data.pagination?.total || 1);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch loyalty customers');
        setCustomers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching loyalty customers:', error);
      toast.error('Failed to load loyalty customers');
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyStats = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/admin/promo-codes/stats');

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalCustomers: data.totalPromoCodes || 0,
          eligibleCustomers: data.loyaltyCodes || 0,
          activeLoyaltyCodes: data.activeLoyaltyCodes || 0,
          totalLoyaltyRewards: data.totalUsage || 0
        });
      }
    } catch (error) {
      console.error('Error fetching loyalty stats:', error);
    }
  };

  const generateLoyaltyCode = async (customerId, discountPercentage = 15) => {
    try {
      const response = await fetch(`http://localhost:5010/api/admin/loyalty/customers/${customerId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discountPercentage })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Loyalty code ${data.promoCode.code} generated with ${discountPercentage}% discount!`);
        fetchLoyaltyCustomers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to generate loyalty code');
      }
    } catch (error) {
      console.error('Error generating loyalty code:', error);
      toast.error('Failed to generate loyalty code');
    }
  };

  const bulkGenerateLoyaltyCodes = async () => {
    if (!window.confirm('Generate loyalty codes for all eligible customers? This will create codes for customers who have purchased 5+ items in the last 3 months.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5010/api/admin/loyalty/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discountPercentage: 15 })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Generated ${data.generatedCodes.length} loyalty codes!`);
        fetchLoyaltyCustomers();
        fetchLoyaltyStats();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to generate loyalty codes');
      }
    } catch (error) {
      console.error('Error bulk generating loyalty codes:', error);
      toast.error('Failed to generate loyalty codes');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loyalty customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loyalty Rewards Management</h1>
              <p className="text-gray-600">Manage customer loyalty rewards for 5+ purchases in 3 months</p>
            </div>
            <button
              onClick={bulkGenerateLoyaltyCodes}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <SparklesIcon className="h-5 w-5" />
              Generate All Loyalty Codes
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eligible Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eligibleCustomers}</p>
                <p className="text-xs text-green-600">5+ purchases in 3 months</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loyalty Codes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeLoyaltyCodes}</p>
                <p className="text-xs text-blue-600">Currently active</p>
              </div>
              <div className="text-3xl">🎁</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rewards Used</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLoyaltyRewards}</p>
                <p className="text-xs text-purple-600">Loyalty codes redeemed</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </motion.div>

        {/* Loyalty Criteria Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-gold-50 to-yellow-50 rounded-xl p-6 mb-8 border border-gold-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <GiftIcon className="h-6 w-6 text-gold-600" />
            <h2 className="text-lg font-semibold text-gold-800">Loyalty Program Criteria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Minimum 5 items purchased</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Within 3 months timeframe</span>
            </div>
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">15% discount reward</span>
            </div>
          </div>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyalty Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchases (3 months)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {customer.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-sm text-gray-500">Joined {formatDate(customer.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {customer.loyalty.eligible ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Not Eligible
                          </span>
                        )}
                        {customer.loyalty.hasActiveCode && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-800">
                            <GiftIcon className="h-3 w-3 mr-1" />
                            Has Code
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{customer.loyalty.totalItems} items</div>
                        <div className="text-gray-500">{customer.loyalty.orderCount} orders</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.loyalty.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        {customer.loyalty.eligible && !customer.loyalty.hasActiveCode && (
                          <button
                            onClick={() => generateLoyaltyCode(customer._id, 15)}
                            className="text-gold-600 hover:text-gold-900"
                          >
                            Generate Code
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Loyalty Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name:</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email:</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Loyalty Status:</label>
                  <p className="text-sm text-gray-900">
                    {selectedCustomer.loyalty.eligible ? 'Eligible for rewards' : 'Not yet eligible'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Items (3 months):</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.loyalty.totalItems} items</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Spent (3 months):</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedCustomer.loyalty.totalSpent)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Count (3 months):</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.loyalty.orderCount} orders</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Has Active Code:</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.loyalty.hasActiveCode ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoyalty; 