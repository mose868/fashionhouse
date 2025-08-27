import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  TrashIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [bulkAutoResponding, setBulkAutoResponding] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showAiResponseModal, setShowAiResponseModal] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    serviceType: '',
    page: 1,
    limit: 20,
    search: ''
  });
  const [responseData, setResponseData] = useState({
    message: '',
    adminNotes: ''
  });
  const [aiResponse, setAiResponse] = useState(null);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:5010/api/admin/contacts?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.data || []);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/admin/contacts/statistics');
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics || {});
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchStatistics();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle response form changes
  const handleResponseChange = (e) => {
    const { name, value } = e.target;
    setResponseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate AI response
  const generateAiResponse = async () => {
    if (!selectedContact) return;

    try {
      setAiLoading(true);
      const response = await axios.post('http://localhost:5010/api/ai/generate-contact-response', {
        name: selectedContact.name,
        email: selectedContact.email,
        subject: selectedContact.subject,
        message: selectedContact.message,
        serviceType: selectedContact.serviceType,
        priority: selectedContact.priority
      });

      if (response.data.success) {
        setAiResponse(response.data.response);
        toast.success('AI response generated successfully!');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setAiLoading(false);
    }
  };

  // Use AI response
  const useAiResponse = () => {
    setResponseData(prev => ({
      ...prev,
      message: aiResponse
    }));
    setShowAiResponseModal(false);
    setShowResponseModal(true);
  };

  // Send response
  const sendResponse = async (e) => {
    e.preventDefault();
    if (!selectedContact || !responseData.message.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:5010/api/contacts/admin/${selectedContact._id}/respond`, {
        responseMessage: responseData.message,
        adminNotes: responseData.adminNotes
      });

      if (response.data.success) {
        toast.success('Response sent successfully!');
        setShowResponseModal(false);
        setResponseData({ message: '', adminNotes: '' });
        setSelectedContact(null);
        fetchContacts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  // Update contact status
  const updateContactStatus = async (contactId, status) => {
    try {
      const response = await axios.patch(`http://localhost:5010/api/contacts/admin/${contactId}/status`, { status });
      if (response.data.success) {
        toast.success('Contact status updated!');
        fetchContacts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
    }
  };

  // Delete contact
  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await axios.delete(`http://localhost:5010/api/contacts/admin/${contactId}`);
        if (response.data.success) {
          toast.success('Contact deleted successfully!');
          fetchContacts();
          fetchStatistics();
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      }
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const analyzeMessageWithAI = async (contactId) => {
    try {
      setAiAnalyzing(true);
      const response = await fetch(`http://localhost:5010/api/ai/analyze-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactId })
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data);
        toast.success('Message analyzed with AI successfully!');
      } else {
        toast.error('Failed to analyze message with AI');
      }
    } catch (error) {
      console.error('Error analyzing message:', error);
      toast.error('Failed to analyze message with AI');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const autoRespondWithAI = async (contactId) => {
    try {
      setAiAnalyzing(true);
      const response = await fetch(`http://localhost:5010/api/ai/auto-respond-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactId })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('AI response sent successfully!');
        fetchContacts();
        setAiResponse(null);
      } else {
        toast.error('Failed to send AI response');
      }
    } catch (error) {
      console.error('Error sending AI response:', error);
      toast.error('Failed to send AI response');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const bulkAutoRespondWithAI = async () => {
    if (!window.confirm('Send AI auto-responses to all new messages? This will automatically respond to messages that are suitable for auto-response.')) {
      return;
    }

    try {
      setBulkAutoResponding(true);
      const response = await fetch('http://localhost:5010/api/ai/bulk-auto-respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Bulk AI auto-response completed. Processed ${data.totalProcessed} messages.`);
        fetchContacts();
      } else {
        toast.error('Failed to perform bulk AI auto-response');
      }
    } catch (error) {
      console.error('Error bulk auto-responding:', error);
      toast.error('Failed to perform bulk AI auto-response');
    } finally {
      setBulkAutoResponding(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
          <p className="text-gray-600">Manage customer inquiries with AI-powered response generation</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Contacts</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">New Today</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.todayCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">High Priority</h3>
            <p className="text-3xl font-bold text-red-600">
              {statistics.byPriority?.find(p => p._id === 'high')?.count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending Response</h3>
            <p className="text-3xl font-bold text-orange-600">
              {statistics.byStatus?.find(s => s._id === 'new')?.count || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="in_progress">In Progress</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                name="serviceType"
                value={filters.serviceType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Services</option>
                <option value="general">General</option>
                <option value="tailoring">Tailoring</option>
                <option value="delivery">Delivery</option>
                <option value="consultation">Consultation</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Customer Inquiries</h2>
              <button
                onClick={bulkAutoRespondWithAI}
                disabled={bulkAutoResponding}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                {bulkAutoResponding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Bulk AI Respond
                  </>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No contacts found matching your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{contact.subject}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(contact.priority)}`}>
                          {contact.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {contact.serviceType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>From:</strong> {contact.name} ({contact.email})
                          </p>
                          {contact.phone && (
                            <p className="text-sm text-gray-600">
                              <strong>Phone:</strong> {contact.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Submitted:</strong> {new Date(contact.submittedAt).toLocaleString()}
                          </p>
                          {contact.responseTime && (
                            <p className="text-sm text-gray-600">
                              <strong>Response Time:</strong> {contact.responseTime}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-sm text-gray-800">{contact.message}</p>
                      </div>
                      
                      {contact.adminNotes && (
                        <div className="bg-yellow-50 p-3 rounded mb-3">
                          <p className="text-sm text-gray-800">
                            <strong>Admin Notes:</strong> {contact.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowAiResponseModal(true);
                        }}
                        className="p-2 text-purple-600 hover:text-purple-800"
                        title="Generate AI Response"
                      >
                        <SparklesIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowResponseModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Respond"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                      </button>
                      
                      <select
                        value={contact.status}
                        onChange={(e) => updateContactStatus(contact._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="in_progress">In Progress</option>
                        <option value="responded">Responded</option>
                        <option value="closed">Closed</option>
                      </select>
                      
                      <button
                        onClick={() => deleteContact(contact._id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Response Modal */}
        {showAiResponseModal && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Generate AI Response</h2>
                  <button
                    onClick={() => setShowAiResponseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Details:</h3>
                    <p><strong>From:</strong> {selectedContact.name} ({selectedContact.email})</p>
                    <p><strong>Subject:</strong> {selectedContact.subject}</p>
                    <p><strong>Message:</strong></p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm">{selectedContact.message}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={generateAiResponse}
                      disabled={aiLoading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          Generate AI Response
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowAiResponseModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>

                  {aiResponse && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Generated Response:</h3>
                      <div className="bg-white p-3 rounded border mb-4">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                      <button
                        onClick={useAiResponse}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                      >
                        Use This Response
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Send Response</h2>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={sendResponse} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Message *
                    </label>
                    <textarea
                      name="message"
                      value={responseData.message}
                      onChange={handleResponseChange}
                      required
                      rows="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your response to the customer..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      name="adminNotes"
                      value={responseData.adminNotes}
                      onChange={handleResponseChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Internal notes about this contact..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading || !responseData.message.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        'Send Response'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowResponseModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts; 