import React from 'react';
import { Book, User, Review, Ad, Section } from '../types';
import BookCard from './BookCard';
import AdCard from './AdCard';

interface BookListProps {
  books: Book[];
  ads: Ad[];
  currentUser: User | null;
  reviews: Review[];
  pendingPurchaseBookIds: string[];
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onDelete: (id: string) => void;
  onRequestSummary: (id: string) => void;
  onRequestEdit: (id: string) => void;
  onPurchase: (id: string) => void;
  searchQuery: string;
  onNavigate: (section: Section) => void;
}

const BookList: React.FC<BookListProps> = ({ books, ads, currentUser, reviews, pendingPurchaseBookIds, onAddReview, onDelete, onRequestSummary, onRequestEdit, onPurchase, searchQuery, onNavigate }) => {

  const filteredBooks = books.filter(book => {
      const query = searchQuery.toLowerCase();
      return book.title.toLowerCase().includes(query) ||
             book.author.toLowerCase().includes(query) ||
             (book.tags && book.tags.some(tag => tag.toLowerCase().includes(query)));
    }
  );

  const itemsWithAds = filteredBooks.reduce((acc, book, index) => {
    acc.push(<BookCard key={book.id} book={book} currentUser={currentUser} onDelete={onDelete} onPurchase={onPurchase} onRequestSummary={onRequestSummary} onRequestEdit={onRequestEdit} reviews={reviews} onAddReview={onAddReview} isPurchasePending={pendingPurchaseBookIds.includes(book.id)} onNavigate={onNavigate} />);
    // Insert an ad after every 3rd book, if ads are available
    if (ads.length > 0 && (index + 1) % 3 === 0) {
      // Rotate through available ads
      const adIndex = Math.floor(index / 3) % ads.length;
      const adToShow = ads[adIndex];
      acc.push(<AdCard key={`ad-${index}`} ad={adToShow} />);
    }
    return acc;
  }, [] as React.ReactNode[]);

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
          <i className="fas fa-book"></i>
          Explore Our Collection
        </h2>
        {searchQuery && (
          <div className="text-sm text-slate-500 dark:text-slate-400 animate-fade-in">
            Showing results for: <span className="font-bold text-slate-700 dark:text-slate-200">"{searchQuery}"</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {books.length > 0 && filteredBooks.length === 0 ? (
           <div className="text-center py-10 px-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <i className="fas fa-search text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">No books found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search query.</p>
          </div>
        ) : itemsWithAds.length > 0 ? (
          itemsWithAds
        ) : (
          <div className="text-center py-10 px-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <i className="fas fa-book-open text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">No books available yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Be the first to upload a book!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default BookList;
