import React from 'react';
import { Book, User, Review, Section } from '../types';
import BookCard from './BookCard';

interface AdminPanelProps {
  books: Book[];
  currentUser: User | null;
  reviews: Review[];
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestSummary: (id: string) => void;
  onRequestEdit: (id: string) => void;
  onNavigate: (section: Section) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ books, currentUser, onApprove, onReject, onRequestSummary, onRequestEdit, reviews, onAddReview, onNavigate }) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-3">
        <i className="fas fa-user-shield"></i>
        Approve User Submissions
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm sm:text-base">
        Review books submitted by other users below. To manage your own uploads, please go to the "My Books" section.
      </p>
      <div className="flex flex-col gap-6">
        {books.length > 0 ? (
          books.map(book => (
            <BookCard 
              key={book.id}
              book={book}
              currentUser={currentUser}
              onDelete={onReject} // onReject is handleDeleteBook
              onApprove={onApprove}
              onPurchase={() => {}}
              onRequestSummary={onRequestSummary}
              onRequestEdit={onRequestEdit}
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
            <p className="text-slate-500 dark:text-slate-400 mt-1">There are currently no books submitted by other users pending approval.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
