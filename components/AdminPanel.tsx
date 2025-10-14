

import React from 'react';
import { Book, Review, Section } from '../types';
import BookCard from './BookCard';
import { useAuth } from '../AuthContext';

interface AdminPanelProps {
  books: Book[];
  reviews: Review[];
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestSummary: (id: string) => void;
  onRequestEdit: (id: string) => void;
  onRequestPreview: (id: string) => void;
  onNavigate: (section: Section) => void;
  onDownload: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ books, onApprove, onReject, onRequestSummary, onRequestEdit, onRequestPreview, reviews, onAddReview, onNavigate, onDownload }) => {
  const { currentUser } = useAuth();
  
  return (
    <>
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-3">
        <i className="fas fa-user-shield"></i>
        Approve Submissions
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm sm:text-base">
        Review all books currently pending approval below. To manage your own uploads, you can also go to the "My Books" section.
      </p>
      <div className="flex flex-col gap-6">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard 
              key={book.id}
              book={book}
              onDelete={onReject} // onReject is handleDeleteBook
              onApprove={onApprove}
              onPurchase={() => {}}
              onDownload={onDownload}
              onRequestSummary={onRequestSummary}
              onRequestEdit={onRequestEdit}
              onRequestPreview={onRequestPreview}
              reviews={reviews}
              onAddReview={onAddReview}
              showStatus={true}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <div className="text-center py-10 px-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <i className="fas fa-inbox text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">No submissions to review</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">There are currently no books pending approval.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
