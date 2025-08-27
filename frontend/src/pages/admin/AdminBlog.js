import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    isFeatured: false,
    status: 'draft'
  });

  // AI Generator states
  const [aiData, setAiData] = useState({
    topic: '',
    targetAudience: 'Fashion-conscious customers interested in African fashion',
    tone: 'Professional yet warm, celebrating African heritage',
    wordCount: '800-1200',
    includeSEO: true,
    includeImages: true
  });

  const [generatedContent, setGeneratedContent] = useState(null);

  // Fetch all blog posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/posts?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`;
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setTotalPages(data.pagination?.total || 1);
        setTotalPosts(data.pagination?.totalPosts || 0);
      } else {
        console.error('Failed to fetch posts');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle AI data changes
  const handleAiDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAiData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate AI content
  const generateAiContent = async () => {
    try {
      setAiLoading(true);
      const response = await axios.post('/api/ai/generate-comprehensive-blog', aiData);
      
      if (response.data.success) {
        setGeneratedContent(response.data.content);
        toast.success('AI content generated successfully!');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setAiLoading(false);
    }
  };

  // Use generated content
  const useGeneratedContent = () => {
    if (generatedContent) {
      setFormData(prev => ({
        ...prev,
        title: generatedContent.title || prev.title,
        excerpt: generatedContent.excerpt || prev.excerpt,
        content: generatedContent.content || prev.content,
        category: generatedContent.category || prev.category,
        tags: generatedContent.tags ? generatedContent.tags.join(', ') : prev.tags
      }));
      setShowAiGenerator(false);
      setShowCreateForm(true);
      toast.success('Generated content applied to form!');
    }
  };

  // Create new post
  const createPost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.title || !formData.content || !formData.category) {
        toast.error('Please fill in all required fields (title, content, category)');
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('excerpt', formData.excerpt || '');
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('status', 'published');
      
      // Handle tags
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      console.log('Sending blog post data:', {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        excerpt: formData.excerpt,
        tags: formData.tags,
        isFeatured: formData.isFeatured,
        hasImage: !!imageFile
      });

      const response = await axios.post('/api/admin/posts', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Blog post created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category: '',
          tags: '',
          isFeatured: false,
          status: 'published'
        });
        setImageFile(null);
        setImagePreview('');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  // Update post status
  const updatePostStatus = async (postId, status) => {
    try {
      const response = await axios.patch(`/api/admin/posts/${postId}/status`, { status });
      if (response.data.success) {
        toast.success('Post status updated!');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Failed to update post status');
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await axios.delete(`/api/admin/posts/${postId}`);
        if (response.data.success) {
          toast.success('Post deleted successfully!');
          fetchPosts();
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Manage your blog content with AI-powered generation</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowAiGenerator(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Content Generator
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Post
          </button>
        </div>

        {/* AI Content Generator Modal */}
        {showAiGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">AI Content Generator</h2>
                  <button
                    onClick={() => setShowAiGenerator(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Topic *
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={aiData.topic}
                      onChange={handleAiDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., African Fashion Trends 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={aiData.targetAudience}
                      onChange={handleAiDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      name="tone"
                      value={aiData.tone}
                      onChange={handleAiDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Professional yet warm, celebrating African heritage">Professional & Warm</option>
                      <option value="Casual and friendly">Casual & Friendly</option>
                      <option value="Luxury and premium">Luxury & Premium</option>
                      <option value="Educational and informative">Educational & Informative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Word Count
                    </label>
                    <select
                      name="wordCount"
                      value={aiData.wordCount}
                      onChange={handleAiDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="500-800">500-800 words</option>
                      <option value="800-1200">800-1200 words</option>
                      <option value="1200-1500">1200-1500 words</option>
                      <option value="1500+">1500+ words</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="includeSEO"
                        checked={aiData.includeSEO}
                        onChange={handleAiDataChange}
                        className="mr-2"
                      />
                      Include SEO optimization
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="includeImages"
                        checked={aiData.includeImages}
                        onChange={handleAiDataChange}
                        className="mr-2"
                      />
                      Include image suggestions
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={generateAiContent}
                      disabled={aiLoading || !aiData.topic}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                    >
                      {aiLoading ? (
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
                    
                    <button
                      onClick={() => setShowAiGenerator(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Generated Content Preview */}
                {generatedContent && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Generated Content Preview:</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {generatedContent.title}</p>
                      <p><strong>Excerpt:</strong> {generatedContent.excerpt}</p>
                      <p><strong>Category:</strong> {generatedContent.category}</p>
                      <p><strong>Tags:</strong> {generatedContent.tags?.join(', ')}</p>
                    </div>
                    <button
                      onClick={useGeneratedContent}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Use This Content
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Blog Post</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={createPost} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        <option value="fashion-tips">Fashion Tips</option>
                        <option value="african-fashion">African Fashion</option>
                        <option value="style-guides">Style Guides</option>
                        <option value="trends">Trends</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="tailoring">Tailoring</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief summary of the post..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      rows="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your blog post content..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="fashion, african-style, trends"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Featured Post
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Post'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
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

        {/* Blog Posts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No blog posts found. Create your first post!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                        {post.isFeatured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">{post.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {post.category}</span>
                        <span>Views: {post.views}</span>
                        <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={post.status}
                        onChange={(e) => updatePostStatus(post._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                      
                      <button
                        onClick={() => deletePost(post._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete post"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlog; 