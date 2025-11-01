import React from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewCard = ({ review }) => {
  const { author, date, rating, content, avatar } = review;
  
  // Create an array of stars based on the rating
  const stars = Array(5).fill(0).map((_, i) => (
    <FaStar 
      key={i} 
      className={i < rating ? 'text-yellow-400' : 'text-gray-300'} 
    />
  ));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
          {avatar ? (
            <img src={avatar} alt={author} className="w-full h-full rounded-full" />
          ) : (
            <span className="text-gray-500 text-xl">{author.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-lg">{author}</h4>
          <div className="flex items-center">
            <div className="flex mr-2">
              {stars}
            </div>
            <span className="text-sm text-gray-500">{date}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-700">{content}</p>
    </div>
  );
};

export default ReviewCard;
