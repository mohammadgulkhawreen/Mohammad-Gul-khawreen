import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  isInteractive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, isInteractive = false }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rating >= star;
        const isHalf = rating > star - 1 && rating < star;
        
        let iconClass = 'fa-star text-slate-300 dark:text-slate-600'; // Empty star
        if (isInteractive) {
            if(rating >= star) iconClass = 'fa-star text-amber-400';
        } else {
             if (isFull) {
                iconClass = 'fa-star text-amber-400';
             } else if (isHalf) {
                iconClass = 'fa-star-half-alt text-amber-400';
             }
        }
       
        return (
          <i
            key={star}
            className={`fas ${iconClass} ${isInteractive ? 'cursor-pointer transition-transform hover:scale-125' : ''}`}
            onClick={() => isInteractive && onRatingChange && onRatingChange(star)}
            onMouseEnter={isInteractive ? (e) => (e.currentTarget.style.color = '#fbbf24') : undefined}
            onMouseLeave={isInteractive ? (e) => (e.currentTarget.style.color = '') : undefined}
            role={isInteractive ? 'button' : 'img'}
            aria-label={isInteractive ? `Rate ${star} stars` : `${rating} out of 5 stars`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;