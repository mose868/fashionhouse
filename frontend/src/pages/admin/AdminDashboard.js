import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIDashboard from '../../components/admin/AIDashboard';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    todayStats: {
      orders: 0,
      revenue: 0,
      customers: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      setLoading(true);
      
      // Use full backend URL instead of proxy
      const response = await fetch('http://localhost:5010/api/admin/dashboard-stats');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setStats(data);
      } else {
        console.log('Response not ok, using mock data');
        // Use mock data if API fails
        setStats({
          totalProducts: 45,
          totalOrders: 127,
          totalCustomers: 89,
          totalRevenue: 2450000,
          recentOrders: [
            {
              _id: '1',
              orderNumber: 'HFH-2024-001',
              customerName: 'Sarah Johnson',
              totalAmount: 25000,
              status: 'pending',
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              orderNumber: 'HFH-2024-002',
              customerName: 'Grace Kimani',
              totalAmount: 85000,
              status: 'processing',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          lowStockProducts: [
            {
              _id: '1',
              name: 'Designer Bridal Gown',
              stockQuantity: 2,
              price: 85000
            },
            {
              _id: '2',
              name: 'Classic High Heels',
              stockQuantity: 3,
              price: 8500
            }
          ],
          todayStats: {
            orders: 8,
            revenue: 156000,
            customers: 5
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use mock data on error
      setStats({
        totalProducts: 45,
        totalOrders: 127,
        totalCustomers: 89,
        totalRevenue: 2450000,
        recentOrders: [
          {
            _id: '1',
            orderNumber: 'HFH-2024-001',
            customerName: 'Sarah Johnson',
            totalAmount: 25000,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            orderNumber: 'HFH-2024-002',
            customerName: 'Grace Kimani',
            totalAmount: 85000,
            status: 'processing',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        lowStockProducts: [
          {
            _id: '1',
            name: 'Designer Bridal Gown',
            stockQuantity: 2,
            price: 85000
          },
          {
            _id: '2',
            name: 'Classic High Heels',
            stockQuantity: 3,
            price: 8500
          }
        ],
        todayStats: {
          orders: 8,
          revenue: 156000,
          customers: 5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: '👥',
      link: 'users',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Orders',
      description: 'View and manage customer orders',
      icon: '📋',
      link: 'orders',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Products',
      description: 'Add and edit products',
      icon: '📦',
      link: 'products',
      color: 'bg-purple-500'
    },
    {
      title: 'View Messages',
      description: 'Check customer messages',
      icon: '💬',
      link: 'contacts',
      color: 'bg-orange-500'
    },
    {
      title: 'AI Tools',
      description: 'Access AI features',
      icon: '🤖',
      link: 'ai',
      color: 'bg-teal-500'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
            </div>
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
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-xs text-green-600">+3 this week</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-green-600">+{stats.todayStats.orders} today</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                <p className="text-xs text-green-600">+{stats.todayStats.customers} today</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600">
                  +{formatCurrency(stats.todayStats.revenue)} today
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      to={action.link}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-gold hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">{action.icon}</span>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link to="orders" className="text-gold hover:text-gold/80 text-sm">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.recentOrders.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent orders</p>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                <Link to="products" className="text-gold hover:text-gold/80 text-sm">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product._id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-red-600">Only {product.stockQuantity} left</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
                {stats.lowStockProducts.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">All products well stocked</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Dashboard Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-medium">3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-medium">{formatCurrency(19291)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Return Rate</span>
                <span className="font-medium">2.1%</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Newsletter Subscribers</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Testimonials</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Promo Codes</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Dashboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <AIDashboard 
            onContentGenerated={(content, type) => {
              console.log('Generated content:', { content, type });
              // You can handle the generated content here
              // For example, automatically save to blog, products, etc.
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 