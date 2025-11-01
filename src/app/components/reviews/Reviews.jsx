'use client';

import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const Reviews = ({ propertyId, initialReviews = [] }) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reviews for the property
  useEffect(() => {
    const fetchReviews = async () => {
      if (propertyId) {
        setIsLoading(true);
        try {
          // Replace with your actual API endpoint
          const response = await fetch(`/api/properties/${propertyId}/reviews`);
          if (!response.ok) {
            throw new Error('Failed to fetch reviews');
          }
          const data = await response.json();
          setReviews(data);
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setError('Failed to load reviews. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchReviews();
  }, [propertyId]);

  const handleSubmitReview = async (newReview) => {
    try {
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/properties/${propertyId}/reviews`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newReview)
      // });
      // const savedReview = await response.json();
      
      // For now, we'll just add it to the local state
      setReviews(prev => [newReview, ...prev]);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-2">{averageRating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReviewForm onSubmit={handleSubmitReview} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;
