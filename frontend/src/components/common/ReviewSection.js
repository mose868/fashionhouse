import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewSection = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [pagination, setPagination] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Check if user has already reviewed this product
  useEffect(() => {
    if (isAuthenticated && user && reviews.length > 0) {
      const hasReviewed = reviews.some(review => review.user._id === user._id);
      setUserHasReviewed(hasReviewed);
    }
  }, [reviews, user, isAuthenticated]);

  const fetchReviews = async (page = 1) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/reviews/product/${productId}?page=${page}&limit=10`);
      if (data.success) {
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (userHasReviewed) {
      toast.error('You have already reviewed this product');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(`/api/reviews/product/${productId}`, newReview);
      
      if (data.success) {
        toast.success('Review submitted successfully!');
        setNewReview({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        setUserHasReviewed(true);
        // Add new review to the top of the list
        setReviews([data.review, ...reviews]);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, index) => {
      const StarComponent = index < rating ? StarSolidIcon : StarIcon;
      return (
        <button
          key={index}
          type="button"
          onClick={() => interactive && onStarClick && onStarClick(index + 1)}
          className={interactive ? 'hover:scale-110 transition-transform' : ''}
          disabled={!interactive}
        >
          <StarComponent 
            className={`h-5 w-5 ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`} 
          />
        </button>
      );
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-lg font-medium text-gray-700">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-gray-600">
                ({pagination.totalReviews || reviews.length} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {isAuthenticated && !userHasReviewed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-gold-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors flex items-center gap-2"
          >
            <PencilIcon className="h-5 w-5" />
            Write a Review
          </motion.button>
        )}

        {!isAuthenticated && (
          <p className="text-gray-600">
            <a href="/login" className="text-gold-600 hover:text-gold-700 font-medium">
              Log in
            </a> to write a review
          </p>
        )}

        {userHasReviewed && (
          <p className="text-green-600 font-medium">✓ You've reviewed this product</p>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-6 mb-8"
          >
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your review..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review *
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-600">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.user.profilePic ? (
                    <img
                      src={review.user.profilePic}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h6 className="font-medium text-gray-900 mb-2">{review.title}</h6>
                  )}
                  
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {pagination.hasPrev && (
            <button
              onClick={() => fetchReviews(pagination.currentPage - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Previous
            </button>
          )}
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          {pagination.hasNext && (
            <button
              onClick={() => fetchReviews(pagination.currentPage + 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection; 