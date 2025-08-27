import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import UserLogin from './pages/AdminLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerLogin from './pages/CustomerLogin';
import CustomerAccount from './pages/CustomerAccount';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import ProductSearchPage from './pages/ProductSearchPage';
import PaymentPendingPage from './pages/PaymentPendingPage';
import AmbassadorProgramPage from './pages/AmbassadorProgramPage';
import AmbassadorDashboard from './pages/AmbassadorDashboard';
import LocationPage from './pages/LocationPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFound from './pages/NotFound';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginVerificationPage from './pages/LoginVerificationPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminContacts from './pages/admin/AdminContacts';
import AdminBlog from './pages/admin/AdminBlog';
import AdminAI from './pages/admin/AdminAI';
import AdminUsers from './pages/admin/AdminUsers';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

// AI Components
import AIFashionAssistant from './components/common/AIFashionAssistant';
import AIConsultant from './components/common/AIConsultant';

// Referral Tracking
import ReferralTracker from './components/common/ReferralTracker';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-white">
                {/* Referral Tracking Component */}
                <ReferralTracker />
                
                {window.location.pathname.startsWith('/admin') ? null : <Navbar />}
                
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    {/* Redirect collections to shop */}
                    <Route path="/collections" element={<Navigate to="/shop" replace />} />
                    <Route path="/collections/:category" element={<Navigate to="/shop" replace />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/products" element={<ProductSearchPage />} />
                    <Route path="/search" element={<ProductSearchPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    {/* Blog routes removed */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment-pending/:orderId" element={<PaymentPendingPage />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    
                    {/* New Routes */}
                    <Route path="/ambassador" element={<AmbassadorProgramPage />} />
            <Route path="/ambassador/dashboard" element={<AmbassadorDashboard />} />
                    <Route path="/location" element={<LocationPage />} />
                    <Route path="/ai-consultant" element={<AIConsultant />} />

                    {/* Authentication Routes */}
                    <Route path="/login" element={<CustomerLogin />} />
                    <Route path="/register" element={<CustomerRegister />} />
                    
                    {/* Customer Account Routes */}
                    <Route path="/account" element={
                      <ProtectedRoute>
                        <CustomerAccount />
                      </ProtectedRoute>
                    } />
                    
                    {/* Order Routes */}
                    <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                    <Route path="/track-order" element={<OrderTracking />} />
                    
                    {/* Forgot Password Route */}
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/verify-login" element={<LoginVerificationPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="contacts" element={<AdminContacts />} />
                      <Route path="blog" element={<AdminBlog />} />
                      <Route path="ai" element={<AdminAI />} />
                    </Route>
                    
                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                {window.location.pathname.startsWith('/admin') ? null : <Footer />}
                
                {/* AI Fashion Assistant */}
                <AIFashionAssistant />
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App; 