import React from 'react';
import { Book, User, Review, Section } from '../types';
import BookCard from './BookCard';

interface MyBooksProps {
  books: Book[];
  currentUser: User | null;
  reviews: Review[];
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onRequestSummary: (id: string) => void;
  onRequestEdit: (id: string) => void;
  onNavigate: (section: Section) => void;
}

const MyBooks: React.FC<MyBooksProps> = ({ books, currentUser, onDelete, onApprove, onRequestSummary, onRequestEdit, reviews, onAddReview, onNavigate }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
        <i className="fas fa-folder-open"></i>
        My Uploaded Books
      </h2>
      <div className="flex flex-col gap-6">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard 
                key={book.id} 
                book={book} 
                currentUser={currentUser} 
                onDelete={onDelete}
                onPurchase={() => {}} 
                showStatus={true}
                onApprove={onApprove}
                onRequestSummary={onRequestSummary}
                onRequestEdit={onRequestEdit}
                reviews={reviews}
                onAddReview={onAddReview}
                onNavigate={onNavigate}
            />
          ))
        ) : (
          <div className="text-center py-10 px-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <i className="fas fa-upload text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">You haven't uploaded any books yet.</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Click on 'Upload' to share your first book!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MyBooks;
