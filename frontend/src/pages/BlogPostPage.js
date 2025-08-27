import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        // Fetch the blog post using the correct endpoint (backend serves at /api/blog/:slug)
        const response = await fetch(`/api/blog/${slug}`);
        
        if (response.status === 404) {
          setError('Article not found');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }

        const data = await response.json();

        const clean = (raw = '') => {
          if (!raw) return '';
          let txt = raw;
          // remove code fences
          txt = txt.replace(/```[a-zA-Z]*[\r\n]?/g, '').replace(/```/g, '').trim();

          // If looks like JSON try parse
          if (/^{[\s\S]*}$/.test(txt)) {
            try {
              const parsed = JSON.parse(txt);
              txt = parsed.content || parsed.excerpt || parsed.title || txt;
            } catch (_) { /* ignore */ }
          }

          // Replace markdown headers with bold line breaks minimally
          txt = txt.replace(/^##\s+/gm, '<h2>').replace(/\n/g, '<br>');
          return txt;
        };

        const cleanedPost = {
          ...data.post,
          excerpt: clean(data.post.excerpt),
          content: clean(data.post.content)
        };

        setPost(cleanedPost);
        setRelatedPosts(data.relatedPosts || []);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPost();
  }, [slug]);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      copy: url
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link');
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The article you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/blog')}
              className="bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
            >
              Browse Articles
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 bg-gradient-to-r from-navy/90 to-gold/30 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${post.featuredImage})`,
            filter: 'brightness(0.3)'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="inline-block px-3 py-1 bg-gold rounded-full text-sm font-medium capitalize">
              {post.category}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl font-playfair font-bold mb-4"
          >
            {post.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4 text-sm text-gray-100"
          >
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>•</span>
            <span>{post.views} views</span>
            {post.author && (
              <>
                <span>•</span>
                <span>By {post.author.firstName} {post.author.lastName}</span>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-gold">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/blog" className="hover:text-gold">Blog</Link>
            </li>
            <li>/</li>
            <li className="text-gray-800 capitalize font-medium">{post.category}</li>
          </ol>
        </motion.nav>

        <div className="lg:grid lg:grid-cols-5 lg:gap-12">
          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
              {/* Excerpt */}
              {post.excerpt && (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border-l-4 border-gold">
                  {/* Sanitize any fenced code blocks that may have been saved in the excerpt */}
                  <p className="text-lg text-gray-700 italic">
                    {(post.excerpt || '').replace(/```[a-zA-Z]*|```/g, '').trim()}
                  </p>
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-xl max-w-none prose-headings:font-playfair prose-headings:text-gray-900 prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900 bg-white p-6 md:p-10 rounded-xl mb-8 text-gray-900 leading-relaxed text-[1.2rem] md:text-[1.3rem]"
                style={{ wordBreak: 'break-word', lineHeight: '1.85', fontSize: '1.15rem' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gold hover:text-white transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.article>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-12 lg:mt-0"
          >
            {/* Share */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="font-semibold text-navy mb-4">Share This Article</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-gold to-gold/80 rounded-2xl p-6 text-white mb-8">
              <h3 className="font-semibold mb-3">Stay in the Loop</h3>
              <p className="text-gold-100 text-sm mb-4">
                Get the latest fashion trends and styling tips delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-lg text-navy text-sm focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="w-full bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-navy mb-4">Browse Categories</h3>
              <div className="space-y-2">
                {['trends', 'styling', 'bridal', 'lifestyle', 'events'].map(category => (
                  <Link
                    key={category}
                    to={`/blog?category=${category}`}
                    className="block px-3 py-2 text-gray-700 hover:bg-gold hover:text-white rounded-lg transition-colors capitalize text-sm"
                  >
                    {category.replace('_', ' ')}
                  </Link>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-playfair font-bold text-navy mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((relatedPost, index) => (
                <motion.article
                  key={relatedPost._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-40 bg-gray-200">
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-gold font-medium capitalize">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-semibold text-navy mt-1 mb-2 line-clamp-2">
                      <Link to={`/blog/${relatedPost.slug}`} className="hover:text-gold transition-colors">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(relatedPost.publishedAt).toLocaleDateString()}</span>
                      <span>{relatedPost.views} views</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/blog"
            className="bg-gold text-white px-8 py-3 rounded-lg hover:bg-gold/90 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Articles
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPostPage; 