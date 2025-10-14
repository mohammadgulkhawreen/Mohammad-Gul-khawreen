import React from 'react';
import { Book } from '../types';

interface FeaturedBookCardProps {
  book: Book;
  onClick: () => void;
}

const FeaturedBookCard: React.FC<FeaturedBookCardProps> = ({ book, onClick }) => {
  return (
    <div
      className="flex-shrink-0 w-48 sm:w-56 cursor-pointer group relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`View details for ${book.title}`}
    >
      <img
        src={book.coverUrl}
        alt={book.title}
        className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {/* Featured Ribbon */}
      <div className="absolute top-2 -right-10 transform rotate-45 bg-amber-400 text-black px-10 py-1 text-center font-bold text-sm shadow-md">
        <i className="fas fa-star text-xs mr-1"></i>
        Featured
      </div>

      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="font-bold text-lg leading-tight truncate group-hover:whitespace-normal">{book.title}</h3>
        <p className="text-sm text-slate-300 truncate">{book.author}</p>
      </div>
    </div>
  );
};

export default FeaturedBookCard;
