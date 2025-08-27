import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import AIProductGenerator from '../../components/admin/AIProductGenerator';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [activeTab, setActiveTab] = useState('ai-generator');
  const [manualForm, setManualForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '0'
  });
  const [manualImages, setManualImages] = useState({
    front: null,
    back: null,
    side: null
  });
  const [manualVideo, setManualVideo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({
    front: null,
    back: null,
    side: null
  });
  const [videoPreview, setVideoPreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage] = useState(20);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(10);
  const [promoExpiry, setPromoExpiry] = useState('');
  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState('');

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, currentPage, searchTerm, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'manual') {
      fetchCategories();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    let timeoutId;
    try {
      setLoading(true);
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(`/api/admin/products?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(categoryFilter)}`, { signal: controller.signal });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.total || 1);
        setTotalProducts(data.pagination?.totalProducts || 0);
      } else {
        const errText = await response.text().catch(()=> '');
        console.error('Failed to fetch products', response.status, errText);
        setProducts([]);
        toast.error('Failed to load products');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        console.warn('Admin products request aborted');
      } else {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
      setProducts([]);
    } finally {
      if (timeoutId) {
        try { clearTimeout(timeoutId); } catch {}
      }
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: `Category for ${newCategoryName.trim()}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Category added successfully');
        setManualForm({...manualForm, category: newCategoryName.trim()});
        setNewCategoryName('');
        setShowNewCategoryInput(false);
        fetchCategories(); // Refresh categories
      } else {
        toast.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) return;
    if (!window.confirm('Delete this category? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted');
        // If deleted category is selected in form, clear it
        const deleted = categories.find(c => c._id === categoryId);
        if (deleted && manualForm.category && manualForm.category.toLowerCase() === deleted.name.toLowerCase()) {
          setManualForm({ ...manualForm, category: '' });
        }
        fetchCategories();
      } else {
        const err = await res.json().catch(()=>({}));
        toast.error(err.message || 'Failed to delete category');
      }
    } catch (e) {
      console.error('Delete category error', e);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreatePromoCode = async () => {
    if (!selectedProduct) return;

    try {
      const promoData = {
        productId: selectedProduct._id,
        code: promoCode || generatePromoCode(),
        discountPercentage: promoDiscount,
        expiryDate: promoExpiry,
        isActive: true
      };

      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promoData)
      });

      if (response.ok) {
        toast.success('Promo code created successfully!');
        setShowPromoModal(false);
        setSelectedProduct(null);
        setPromoCode('');
        setPromoDiscount(10);
        setPromoExpiry('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create promo code');
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast.error('Failed to create promo code');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  // Helper function to validate image uploads
  const validateImageUpload = () => {
    if (!manualImages.front) {
      toast.error('Front view image is required');
      return false;
    }
    return true;
  };

  // Helper function to get image count
  const getImageCount = () => {
    return Object.values(manualImages).filter(img => img !== null).length;
  };

  const tabs = [
    {
      id: 'ai-generator',
      name: 'AI Product Generator',
      icon: SparklesIcon,
      description: 'Generate product details with Kenyan market pricing'
    },
    {
      id: 'manual',
      name: 'Create Manually',
      icon: PlusIcon,
      description: 'Add a product by filling a simple form'
    },
    {
      id: 'products',
      name: 'Manage Products',
      icon: PlusIcon,
      description: 'View and manage existing products'
    }
  ];

  if (loading && activeTab === 'products') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Create and manage your fashion products</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-gold-500 text-gold-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'ai-generator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AIProductGenerator />
          </motion.div>
        )}

        {activeTab === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Product Manually</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e)=>setManualForm({...manualForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {!showNewCategoryInput ? (
                  <div className="space-y-2">
                    <select
                      value={manualForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'new') {
                          setShowNewCategoryInput(true);
                        } else {
                          setManualForm({...manualForm, category: e.target.value});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                      <option value="new">+ Add New Category</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3 py-1 bg-gold-500 text-white rounded text-sm hover:bg-gold-600"
                      >
                        Add Category
                      </button>
                      {categories.length > 0 && (
                        <select
                          value={deletingCategoryId}
                          onChange={(e)=>setDeletingCategoryId(e.target.value)}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Select to delete…</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={()=>handleDeleteCategory(deletingCategoryId)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        disabled={!deletingCategoryId}
                      >
                        Delete Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryName('');
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                <input
                  type="number"
                  value={manualForm.price}
                  onChange={(e)=>setManualForm({...manualForm, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={manualForm.stock}
                  onChange={(e)=>setManualForm({...manualForm, stock: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={manualForm.description}
                  onChange={(e)=>setManualForm({...manualForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
                             <div className="md:col-span-2">
                 <div className="flex items-center justify-between mb-3">
                   <label className="block text-sm font-medium text-gray-700">Product Images (Multiple Views)</label>
                   <span className="text-sm text-gray-500">
                     {getImageCount()}/3 images uploaded
                   </span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1">Front View *</label>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e)=>{
                         const file = e.target.files?.[0]||null;
                         setManualImages(prev => ({...prev, front: file}));
                         if (file) {
                           const reader = new FileReader();
                           reader.onload = (e) => setImagePreviews(prev => ({...prev, front: e.target.result}));
                           reader.readAsDataURL(file);
                         } else {
                           setImagePreviews(prev => ({...prev, front: null}));
                         }
                       }}
                       className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
                     />
                     {imagePreviews.front && (
                       <div className="mt-2">
                         <img 
                           src={imagePreviews.front} 
                           alt="Front view preview" 
                           className="w-full h-24 object-cover rounded-lg border"
                         />
                       </div>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1">Back View</label>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e)=>{
                         const file = e.target.files?.[0]||null;
                         setManualImages(prev => ({...prev, back: file}));
                         if (file) {
                           const reader = new FileReader();
                           reader.onload = (e) => setImagePreviews(prev => ({...prev, back: e.target.result}));
                           reader.readAsDataURL(file);
                         } else {
                           setImagePreviews(prev => ({...prev, back: null}));
                         }
                       }}
                       className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
                     />
                     {imagePreviews.back && (
                       <div className="mt-2">
                         <img 
                           src={imagePreviews.back} 
                           alt="Back view preview" 
                           className="w-full h-24 object-cover rounded-lg border"
                         />
                       </div>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1">Side View</label>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e)=>{
                         const file = e.target.files?.[0]||null;
                         setManualImages(prev => ({...prev, side: file}));
                         if (file) {
                           const reader = new FileReader();
                           reader.onload = (e) => setImagePreviews(prev => ({...prev, side: e.target.result}));
                           reader.readAsDataURL(file);
                         } else {
                           setImagePreviews(prev => ({...prev, side: null}));
                         }
                       }}
                       className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
                     />
                     {imagePreviews.side && (
                       <div className="mt-2">
                         <img 
                           src={imagePreviews.side} 
                           alt="Side view preview" 
                           className="w-full h-24 object-cover rounded-lg border"
                         />
                       </div>
                     )}
                   </div>
                 </div>
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Product Video</label>
                 <input
                   type="file"
                   accept="video/*"
                   onChange={(e)=>{
                     const file = e.target.files?.[0]||null;
                     setManualVideo(file);
                     if (file) {
                       const reader = new FileReader();
                       reader.onload = (e) => setVideoPreview(e.target.result);
                       reader.readAsDataURL(file);
                     } else {
                       setVideoPreview(null);
                     }
                   }}
                   className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
                 />
                 {videoPreview && (
                   <div className="mt-2">
                     <video 
                       src={videoPreview} 
                       controls 
                       className="w-full max-w-md rounded-lg border"
                     />
                   </div>
                 )}
               </div>
            </div>

                                                   {/* Preview Section */}
              {showPreview && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {/* Main Image (Front View) */}
                      {imagePreviews.front ? (
                        <img 
                          src={imagePreviews.front} 
                          alt="Product front view" 
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">No front image selected</span>
                        </div>
                      )}
                      
                      {/* Additional Images */}
                      {(imagePreviews.back || imagePreviews.side) && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {imagePreviews.back && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Back View</p>
                              <img 
                                src={imagePreviews.back} 
                                alt="Product back view" 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          {imagePreviews.side && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Side View</p>
                              <img 
                                src={imagePreviews.side} 
                                alt="Product side view" 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Video Preview */}
                      {videoPreview && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-600 mb-1">Product Video</p>
                          <video 
                            src={videoPreview} 
                            controls 
                            className="w-full rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{manualForm.name || 'Product Name'}</h4>
                      <p className="text-gray-600 mb-4">{manualForm.description || 'Product description will appear here...'}</p>
                      <div className="space-y-2">
                        <p><span className="font-semibold">Category:</span> {manualForm.category || 'Not specified'}</p>
                        <p><span className="font-semibold">Price:</span> KES {manualForm.price || '0'}</p>
                        <p><span className="font-semibold">Stock:</span> {manualForm.stock || '0'} units</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

             <div className="pt-6 flex gap-3">
               <button
                 onClick={() => setShowPreview(!showPreview)}
                 className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
               >
                 {showPreview ? 'Hide Preview' : 'Show Preview'}
               </button>
                             <button
                 onClick={async ()=>{
                   if (!manualForm.name || !manualForm.price) { toast.error('Name and price are required'); return; }
                   if (!validateImageUpload()) return;
                   try {
                     const form = new FormData();
                     form.append('name', manualForm.name);
                     form.append('description', manualForm.description);
                     form.append('category', manualForm.category);
                     form.append('price', String(parseInt(manualForm.price||'0',10)));
                     form.append('stock', String(parseInt(manualForm.stock||'0',10)));
                     
                     // Add images with proper naming
                     if (manualImages.front) form.append('images', manualImages.front);
                     if (manualImages.back) form.append('images', manualImages.back);
                     if (manualImages.side) form.append('images', manualImages.side);
                     
                     if (manualVideo) form.append('video', manualVideo);
                     const res = await fetch('/api/admin/products', { method: 'POST', body: form });
                     if (res.ok) {
                       toast.success('Product created');
                       setManualForm({ name:'', description:'', category:'', price:'', stock:'0' });
                       setManualImages({ front: null, back: null, side: null });
                       setManualVideo(null);
                       setImagePreviews({ front: null, back: null, side: null });
                       setVideoPreview(null);
                       setShowPreview(false);
                       setActiveTab('products');
                       fetchProducts();
                     } else {
                       const err = await res.json().catch(()=>({}));
                       toast.error(err.message||'Failed to create product');
                     }
                   } catch (e) {
                     console.error(e);
                     toast.error('Failed to create product');
                   }
                 }}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
               >
                 Save Product
               </button>
                             <button
                 onClick={()=>{ 
                   setManualForm({ name:'', description:'', category:'', price:'', stock:'0' }); 
                   setManualImages({ front: null, back: null, side: null }); 
                   setManualVideo(null);
                   setImagePreviews({ front: null, back: null, side: null });
                   setVideoPreview(null);
                   setShowPreview(false);
                 }}
                 className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg"
               >
                 Reset
               </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:w-64">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Add Product Button */}
                <button 
                  onClick={() => setActiveTab('ai-generator')}
                  className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <SparklesIcon className="h-5 w-5" />
                  AI Generate
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                              {/* Main thumbnail (first image) */}
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                                {product.images?.[0]?.url ? (
                                  <img 
                                    src={product.images[0].url} 
                                    alt={product.name}
                                    className="h-12 w-12 object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <span className="text-gray-500 text-xs" style={{ display: product.images?.[0]?.url ? 'none' : 'block' }}>
                                  No Image
                                </span>
                              </div>
                              
                              {/* Additional image indicators */}
                              {product.images && product.images.length > 1 && (
                                <div className="flex space-x-1">
                                  {product.images.slice(1, 3).map((image, index) => (
                                    <div key={index} className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                      <img 
                                        src={image.url} 
                                        alt={`${product.name} view ${index + 2}`}
                                        className="h-8 w-8 object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  ))}
                                  {product.images.length > 3 && (
                                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                                      <span className="text-xs text-gray-500">+{product.images.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Video indicator */}
                              {product.videoUrl && (
                                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stockQuantity > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stockQuantity > 0 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stockQuantity || 0} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gold-600 hover:text-gold-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
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
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts; 