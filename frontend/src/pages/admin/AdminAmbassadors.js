import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminAmbassadors = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [aiVerifying, setAiVerifying] = useState(false);
  const [bulkVerifying, setBulkVerifying] = useState(false);

  useEffect(() => {
    fetchAmbassadors();
  }, [currentPage, selectedStatus, searchTerm]);

  const fetchAmbassadors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5010/api/admin/ambassadors?page=${currentPage}&limit=20&status=${selectedStatus}&search=${searchTerm}`);

      if (response.ok) {
        const data = await response.json();
        setAmbassadors(data.ambassadors || []);
        setTotalPages(data.pagination?.total || 1);
      } else {
        console.error('Failed to fetch ambassadors');
        setAmbassadors([]);
      }
    } catch (error) {
      console.error('Error fetching ambassadors:', error);
      setAmbassadors([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyWithAI = async (ambassadorId) => {
    try {
      setAiVerifying(true);
      const response = await fetch(`http://localhost:5010/api/ambassadors/verify/${ambassadorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`AI verification completed for ${data.ambassador.firstName} ${data.ambassador.lastName}`);
        fetchAmbassadors();
        
        // Show verification details with social media results
        setSelectedAmbassador({
          ...data.ambassador,
          verification: data.verification
        });
        setShowDetails(true);
      } else {
        toast.error('Failed to verify ambassador with AI');
      }
    } catch (error) {
      console.error('Error verifying ambassador:', error);
      toast.error('Failed to verify ambassador with AI');
    } finally {
      setAiVerifying(false);
    }
  };

  const bulkVerifyWithAI = async () => {
    if (!window.confirm('Verify all pending ambassador applications with AI? This will process all pending applications automatically.')) {
      return;
    }

    try {
      setBulkVerifying(true);
      const response = await fetch('http://localhost:5010/api/ambassadors/bulk-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Bulk AI verification completed. Processed ${data.totalProcessed} applications.`);
        fetchAmbassadors();
      } else {
        toast.error('Failed to perform bulk AI verification');
      }
    } catch (error) {
      console.error('Error bulk verifying ambassadors:', error);
      toast.error('Failed to perform bulk AI verification');
    } finally {
      setBulkVerifying(false);
    }
  };

  const updateAmbassadorStatus = async (ambassadorId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5010/api/admin/ambassadors/${ambassadorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Ambassador status updated successfully');
        fetchAmbassadors();
      } else {
        toast.error('Failed to update ambassador status');
      }
    } catch (error) {
      console.error('Error updating ambassador status:', error);
      toast.error('Failed to update ambassador status');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTierColor = (tier) => {
    const colors = {
      Bronze: 'bg-orange-100 text-orange-800',
      Silver: 'bg-gray-100 text-gray-800',
      Gold: 'bg-yellow-100 text-yellow-800',
      Diamond: 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ambassadors...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Ambassador Management</h1>
              <p className="text-gray-600">Manage brand ambassadors and AI verification</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={bulkVerifyWithAI}
                disabled={bulkVerifying}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                {bulkVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Bulk AI Verify
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or referral code..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Ambassadors List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ambassador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ambassadors.map((ambassador) => (
                  <tr key={ambassador._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center">
                            <span className="text-gold-800 font-medium">
                              {ambassador.firstName.charAt(0)}{ambassador.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ambassador.firstName} {ambassador.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{ambassador.email}</div>
                          <div className="text-xs text-gray-400">
                            {ambassador.referralCode}
                          </div>
                          {/* Social Media Status Indicator */}
                          {ambassador.socialMedia && (
                            <div className="flex items-center gap-1 mt-1">
                              {ambassador.socialMedia.instagram?.handle && (
                                <span className="text-xs bg-pink-100 text-pink-800 px-1 rounded">IG</span>
                              )}
                              {ambassador.socialMedia.tiktok?.handle && (
                                <span className="text-xs bg-black text-white px-1 rounded">TT</span>
                              )}
                              {ambassador.socialMedia.facebook?.handle && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">FB</span>
                              )}
                              {ambassador.socialMedia.twitter?.handle && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">TW</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ambassador.status)}`}>
                        {ambassador.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(ambassador.tier)}`}>
                        {ambassador.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatCurrency(ambassador.totalEarnings)}</div>
                      <div className="text-xs text-gray-500">
                        {ambassador.commissionRate * 100}% rate
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{ambassador.totalReferrals}</div>
                      <div className="text-xs text-gray-500">
                        {ambassador.activReferrals} active
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ambassador.appliedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAmbassador(ambassador);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {ambassador.status === 'pending' && (
                          <button
                            onClick={() => verifyWithAI(ambassador._id)}
                            disabled={aiVerifying}
                            className="text-purple-600 hover:text-purple-900"
                            title="Verify with AI (checks social media followers)"
                          >
                            <SparklesIcon className="h-4 w-4" />
                          </button>
                        )}
                        {ambassador.status === 'pending' && (
                          <button
                            onClick={() => updateAmbassadorStatus(ambassador._id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        {ambassador.status === 'pending' && (
                          <button
                            onClick={() => updateAmbassadorStatus(ambassador._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Ambassador Details Modal */}
      {showDetails && selectedAmbassador && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ambassador Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <p><strong>Name:</strong> {selectedAmbassador.firstName} {selectedAmbassador.lastName}</p>
                  <p><strong>Email:</strong> {selectedAmbassador.email}</p>
                  <p><strong>Phone:</strong> {selectedAmbassador.phone}</p>
                  <p><strong>Location:</strong> {selectedAmbassador.location?.city}, {selectedAmbassador.location?.country}</p>
                  <p><strong>Referral Code:</strong> {selectedAmbassador.referralCode}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Performance</h4>
                  <p><strong>Tier:</strong> {selectedAmbassador.tier}</p>
                  <p><strong>Commission Rate:</strong> {(selectedAmbassador.commissionRate * 100).toFixed(1)}%</p>
                  <p><strong>Total Earnings:</strong> {formatCurrency(selectedAmbassador.totalEarnings)}</p>
                  <p><strong>Total Referrals:</strong> {selectedAmbassador.totalReferrals}</p>
                  <p><strong>Active Referrals:</strong> {selectedAmbassador.activReferrals}</p>
                </div>

                {selectedAmbassador.verification && (
                  <div>
                    <h4 className="font-medium text-gray-900">AI Verification Results</h4>
                    <p><strong>Verification Score:</strong> {selectedAmbassador.verification.verification_score}/100</p>
                    <p><strong>Recommendation:</strong> {selectedAmbassador.verification.recommendation}</p>
                    <p><strong>Brand Alignment:</strong> {selectedAmbassador.verification.brand_alignment}</p>
                    <p><strong>Risk Assessment:</strong> {selectedAmbassador.verification.risk_assessment}</p>
                    <p><strong>Auto-approve:</strong> {selectedAmbassador.verification.auto_approve ? 'YES' : 'NO'}</p>
                    
                    {/* Social Media Verification Results */}
                    {selectedAmbassador.verification.social_media_results && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Social Media Analysis</h5>
                        <p><strong>Total Followers:</strong> {selectedAmbassador.verification.social_media_results.totalFollowers}</p>
                        <p><strong>Meets Minimum (500+):</strong> 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            selectedAmbassador.verification.social_media_results.hasMinimumFollowers 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedAmbassador.verification.social_media_results.hasMinimumFollowers ? 'YES' : 'NO'}
                          </span>
                        </p>
                        <p><strong>Platforms:</strong> {selectedAmbassador.verification.social_media_results.platforms.join(', ') || 'None'}</p>
                        
                        {/* Individual Platform Results */}
                        <div className="mt-3 space-y-2">
                          {selectedAmbassador.verification.social_media_results.instagram && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Instagram:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {selectedAmbassador.verification.social_media_results.instagram.followers} followers
                                </span>
                                {selectedAmbassador.verification.social_media_results.instagram.requiresManualCheck && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Manual Check</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {selectedAmbassador.verification.social_media_results.tiktok && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">TikTok:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {selectedAmbassador.verification.social_media_results.tiktok.followers} followers
                                </span>
                                {selectedAmbassador.verification.social_media_results.tiktok.requiresManualCheck && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Manual Check</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <strong>Strengths:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {selectedAmbassador.verification.strengths?.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Concerns:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {selectedAmbassador.verification.concerns?.map((concern, index) => (
                          <li key={index}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {selectedAmbassador.verification.follow_up_questions && selectedAmbassador.verification.follow_up_questions.length > 0 && (
                      <div>
                        <strong>Follow-up Questions:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {selectedAmbassador.verification.follow_up_questions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Media Information */}
                {selectedAmbassador.socialMedia && (
                  <div>
                    <h4 className="font-medium text-gray-900">Social Media Profiles</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAmbassador.socialMedia.instagram?.handle && (
                        <div className="p-3 bg-pink-50 rounded-lg">
                          <p className="text-sm font-medium text-pink-800">Instagram</p>
                          <p className="text-sm text-gray-600">@{selectedAmbassador.socialMedia.instagram.handle}</p>
                          {selectedAmbassador.socialMedia.instagram.followers && (
                            <p className="text-xs text-gray-500">{selectedAmbassador.socialMedia.instagram.followers} followers</p>
                          )}
                        </div>
                      )}
                      
                      {selectedAmbassador.socialMedia.tiktok?.handle && (
                        <div className="p-3 bg-black text-white rounded-lg">
                          <p className="text-sm font-medium">TikTok</p>
                          <p className="text-sm">@{selectedAmbassador.socialMedia.tiktok.handle}</p>
                          {selectedAmbassador.socialMedia.tiktok.followers && (
                            <p className="text-xs opacity-75">{selectedAmbassador.socialMedia.tiktok.followers} followers</p>
                          )}
                        </div>
                      )}
                      
                      {selectedAmbassador.socialMedia.facebook?.handle && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Facebook</p>
                          <p className="text-sm text-gray-600">{selectedAmbassador.socialMedia.facebook.handle}</p>
                          {selectedAmbassador.socialMedia.facebook.followers && (
                            <p className="text-xs text-gray-500">{selectedAmbassador.socialMedia.facebook.followers} followers</p>
                          )}
                        </div>
                      )}
                      
                      {selectedAmbassador.socialMedia.twitter?.handle && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Twitter</p>
                          <p className="text-sm text-gray-600">@{selectedAmbassador.socialMedia.twitter.handle}</p>
                          {selectedAmbassador.socialMedia.twitter.followers && (
                            <p className="text-xs text-gray-500">{selectedAmbassador.socialMedia.twitter.followers} followers</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAmbassadors; 