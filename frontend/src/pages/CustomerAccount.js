import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CustomerAccount = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState({});

  // New state for avatar & billing info
  const emptyBilling = {
    region: '',
    city: '',
    estate: '',
    building: '',
    directions: ''
  };
  const [billing, setBilling] = useState(emptyBilling);
  // Avatar upload removed as per latest requirement
  const [saving, setSaving] = useState(false);

  // (avatar related helpers removed)

  useEffect(() => {
    // ProtectedRoute already handles authentication, just fetch user data
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await fetch('/api/customers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
        setWishlist(profileData.wishlist || []);

        // prep billing only
        setBilling(profileData.billingInfo || emptyBilling);
      }

      // Fetch user orders
      const ordersResponse = await fetch('/api/customers/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/customers/wishlist/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item._id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Avatar change handler removed

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { billingInfo: billing };

      const res = await axios.put('/api/auth/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
 
      setProfile(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      console.error('Profile update error', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'orders', name: 'My Orders', icon: '📦' },
    { id: 'wishlist', name: 'Wishlist', icon: '❤️' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'addresses', name: 'Addresses', icon: '📍' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-playfair font-bold text-navy">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account and view your orders
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gold text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Account Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-gold/10 to-gold/5 p-6 rounded-xl">
                      <div className="flex items-center">
                        <div className="p-3 bg-gold rounded-lg">
                          <span className="text-white text-xl">📦</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-navy">{orders.length}</p>
                          <p className="text-gray-600">Total Orders</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-100 to-pink-50 p-6 rounded-xl">
                      <div className="flex items-center">
                        <div className="p-3 bg-pink-500 rounded-lg">
                          <span className="text-white text-xl">❤️</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-navy">{wishlist.length}</p>
                          <p className="text-gray-600">Wishlist Items</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-100 to-green-50 p-6 rounded-xl">
                      <div className="flex items-center">
                        <div className="p-3 bg-green-500 rounded-lg">
                          <span className="text-white text-xl">👤</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-lg font-bold text-navy">
                            {profile?.emailVerified ? 'Verified' : 'Pending'}
                          </p>
                          <p className="text-gray-600">Account Status</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-sm font-medium mt-1">KES {order.totalAmount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No orders yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">My Orders</h2>
                  
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-gray-600">
                                +{order.items.length - 3} more items
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <p className="font-semibold">Total: KES {order.totalAmount}</p>
                            <div className="space-x-3">
                              <button className="text-gold hover:underline text-sm">
                                View Details
                              </button>
                              <button className="text-gold hover:underline text-sm">
                                Track Order
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                      <a
                        href="/shop"
                        className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors"
                      >
                        Start Shopping
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
                  
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((product) => (
                        <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-medium mb-2">{product.name}</h3>
                            <p className="text-gold font-semibold mb-3">KES {product.price}</p>
                            <div className="flex space-x-2">
                              <button className="flex-1 bg-gold text-white py-2 px-3 rounded text-sm hover:bg-gold/90 transition-colors">
                                Add to Cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(product._id)}
                                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">❤️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
                      <a
                        href="/shop"
                        className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors"
                      >
                        Explore Products
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Profile & Billing</h2>

                  <form className="space-y-8" onSubmit={handleSaveProfile}>
                    {/* Avatar upload removed */}

                    {/* Billing Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name & phone removed as they are collected at signup */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Region / County</label>
                          <input type="text" name="region" value={billing.region} onChange={handleBillingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City / Town</label>
                          <input type="text" name="city" value={billing.city} onChange={handleBillingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Estate / Area</label>
                          <input type="text" name="estate" value={billing.estate} onChange={handleBillingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Building / Street</label>
                          <input type="text" name="building" value={billing.building} onChange={handleBillingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Directions / Landmark</label>
                          <textarea name="directions" value={billing.directions} onChange={handleBillingChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" rows="2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <button type="submit" disabled={saving} className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50">
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Saved Addresses</h2>
                  
                  <div className="space-y-6">
                    {/* Default Address */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-gold text-white px-2 py-1 rounded text-xs font-medium">Default</span>
                            <h3 className="font-semibold">Home Address</h3>
                          </div>
                          <div className="text-gray-600 space-y-1">
                            <p>123 Main Street</p>
                            <p>Westlands, Nairobi</p>
                            <p>Near Sarit Centre</p>
                            <p>Phone: +254 700 000 000</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gold hover:text-gold/80 text-sm">Edit</button>
                          <button className="text-gray-400 hover:text-gray-600 text-sm">Delete</button>
                        </div>
                      </div>
                    </div>

                    {/* Add New Address */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold transition-colors cursor-pointer">
                      <div className="text-3xl mb-2">📍</div>
                      <h3 className="font-medium text-gray-900 mb-1">Add New Address</h3>
                      <p className="text-gray-600 text-sm">Save additional delivery addresses</p>
                    </div>

                    {/* Address Management Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 text-xl">💡</div>
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Address Management</h4>
                          <p className="text-blue-700 text-sm">
                            Save multiple addresses for quick checkout. Set one as default for automatic shipping.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Account Information */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Email Address</p>
                            <p className="text-gray-600 text-sm">{user.email}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Verified
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Phone Number</p>
                            <p className="text-gray-600 text-sm">{user.phone || 'Not provided'}</p>
                          </div>
                          <button className="text-gold hover:text-gold/80 text-sm">Update</button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Account Created</p>
                            <p className="text-gray-600 text-sm">
                              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-gray-600 text-sm">Receive order updates and promotions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-gray-600 text-sm">Get delivery updates via SMS</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Marketing Communications</p>
                            <p className="text-gray-600 text-sm">Receive fashion updates and offers</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-gray-600 text-sm">Update your account password</p>
                          </div>
                          <button className="text-gold hover:text-gold/80 text-sm">Update</button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-gray-600 text-sm">Add extra security to your account</p>
                          </div>
                          <button className="text-gold hover:text-gold/80 text-sm">Enable</button>
                        </div>
                      </div>
                    </div>

                    {/* Data & Privacy */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Download My Data</p>
                            <p className="text-gray-600 text-sm">Get a copy of your personal data</p>
                          </div>
                          <button className="text-gold hover:text-gold/80 text-sm">Request</button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-gray-600 text-sm">Permanently delete your account</p>
                          </div>
                          <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount; 