import React, { useState, useMemo } from 'react';
import { Book, User, Review, Section } from '../types';
import StarRating from './StarRating';

interface BookCardProps {
  book: Book;
  currentUser: User | null;
  reviews: Review[];
  isPurchasePending?: boolean;
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onDelete: (id: string) => void;
  onPurchase: (id: string) => void;
  showStatus?: boolean;
  onApprove?: (id: string) => void;
  onRequestSummary?: (id: string) => void;
  onRequestEdit?: (id: string) => void;
  onNavigate?: (section: Section) => void;
}

const ReviewForm: React.FC<{
  bookId: string;
  onAddReview: (bookId: string, rating: number, comment: string) => void;
}> = ({ bookId, onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment.');
      return;
    }
    onAddReview(bookId, rating, comment);
    setRating(0);
    setComment('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <h4 className="font-bold text-slate-700 dark:text-slate-200">نظر پریږدئ</h4>
      <div>
          <StarRating rating={rating} onRatingChange={setRating} isInteractive={true} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="خپله تبصره ولیکئ..."
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
        rows={3}
      ></textarea>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="self-start bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all">
        لیږل
      </button>
    </form>
  );
};


const BookCard: React.FC<BookCardProps> = ({ book, currentUser, reviews, onAddReview, onDelete, onPurchase, showStatus = false, onApprove, onRequestSummary, onRequestEdit, isPurchasePending = false, onNavigate }) => {
  const [showReviews, setShowReviews] = useState(false);
  
  const bookReviews = useMemo(() => 
    reviews.filter(r => r.bookId === book.id).sort((a,b) => b.createdAt - a.createdAt),
    [reviews, book.id]
  );
  
  const averageRating = useMemo(() => {
    if (bookReviews.length === 0) return 0;
    const total = bookReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / bookReviews.length;
  }, [bookReviews]);
  
  const statusBadge = {
    pending: <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-yellow-900/50 dark:text-yellow-300">Pending Approval</span>,
    approved: <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">Approved</span>,
  };

  const isOwner = currentUser?.username === book.uploadedBy;
  const isAdmin = currentUser?.role === 'admin';
  const isForSale = book.isForSale && book.price > 0;
  const hasPurchased = currentUser?.purchasedBookIds?.includes(book.id) || false;

  const canRead = !isForSale || hasPurchased || isOwner || isAdmin;
  const canEdit = (isOwner || isAdmin) && onRequestEdit;
  const canDelete = isOwner || isAdmin;
  const canApprove = isAdmin && book.status === 'pending' && onApprove;
  
  const hasActions = canEdit || canDelete || canApprove;
  
  const userHasReviewed = currentUser && bookReviews.some(r => r.username === currentUser.username);


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-900/50">
      <div className="flex flex-col md:flex-row">
        <img src={book.coverDataUrl} alt={book.title} className="w-full h-48 md:h-auto md:w-40 object-cover" />
        <div className="p-5 flex flex-col flex-grow w-full">
          <div className="flex justify-between items-start mb-2">
              <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{book.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">By {book.author}</p>
                    {book.language && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600 text-sm hidden sm:inline">|</span>
                        <div className="flex items-center gap-1.5">
                          <i className="fas fa-language text-slate-400 dark:text-slate-500" aria-hidden="true"></i>
                          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{book.language}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <StarRating rating={averageRating} />
                    <span className="text-xs">({bookReviews.length} {bookReviews.length === 1 ? 'review' : 'reviews'})</span>
                  </div>
                   {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {book.tags.map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-slate-700 dark:text-slate-300">
                                #{tag}
                            </span>
                        ))}
                    </div>
                  )}
              </div>
              <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                    {showStatus && statusBadge[book.status]}
                    {hasPurchased && <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900/50 dark:text-blue-300"><i className="fas fa-check-circle mr-1"></i>Purchased</span>}
              </div>
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
              <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="flex-1 text-center bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                  <i className={`fas ${showReviews ? 'fa-comments' : 'fa-comment-dots'}`}></i> کتنې
              </button>
              {book.status === 'approved' ? (
                  canRead ? (
                    <a href={book.pdfDataUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                        <i className="fas fa-book-open"></i> Read Online
                    </a>
                  ) : isPurchasePending ? (
                     <button disabled className="flex-1 text-center bg-amber-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                        <i className="fas fa-hourglass-half"></i> Purchase Pending
                    </button>
                  ) : (
                    <button onClick={() => onPurchase(book.id)} className="flex-1 text-center bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2">
                        <i className="fas fa-shopping-cart"></i> Buy Now ({book.price} AFN)
                    </button>
                  )
              ) : (
                  <a href={book.pdfDataUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 transition-all duration-300 flex items-center justify-center gap-2">
                      <i className="fas fa-eye"></i> Review PDF
                  </a>
              )}
          </div>

          {book.status === 'approved' && canRead && (
            <div className="flex items-center justify-end mt-4">
              <a href={book.pdfDataUrl} download={book.pdfFileName} className="text-center bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2">
                <i className="fas fa-download"></i> Download
              </a>
            </div>
          )}
          
          {hasActions && (
              <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 flex flex-wrap items-center justify-end gap-3">
                  {onRequestSummary && (
                    <button
                        onClick={() => onRequestSummary(book.id)}
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold py-2 px-4 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/80 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-wand-magic-sparkles"></i> خلاصه
                    </button>
                  )}
                  {canApprove && (
                      <button
                          onClick={() => onApprove!(book.id)}
                          className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                          <i className="fas fa-check"></i> Approve
                      </button>
                  )}
                  {canEdit && (
                      <button
                          onClick={() => onRequestEdit!(book.id)}
                          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                          <i className="fas fa-pencil-alt"></i> Edit
                      </button>
                  )}
                  {canDelete && (
                      <button
                          onClick={() => onDelete(book.id)}
                          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                          <i className="fas fa-trash"></i>
                          {isAdmin && book.status === 'pending' ? 'Reject' : 'Delete'}
                      </button>
                  )}
              </div>
          )}
        </div>
      </div>
      {showReviews && (
        <div className="p-5 border-t-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">کتنې ({bookReviews.length})</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {bookReviews.length > 0 ? bookReviews.map(review => (
              <div key={review.id} className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{review.username}</span>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-slate-600 dark:text-slate-300">{review.comment}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            )) : <p className="text-slate-500 dark:text-slate-400">تر اوسه کومه کتنه نشته. لومړی اوسئ!</p>}
          </div>
          {currentUser && !userHasReviewed && book.status === 'approved' && canRead && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <ReviewForm bookId={book.id} onAddReview={onAddReview} />
            </div>
          )}
           {currentUser && userHasReviewed && <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">You have already reviewed this book.</p>}
           {!currentUser && <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">Please <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(Section.Login); }} className="text-indigo-600 dark:text-indigo-400 font-bold">login</a> to leave a review.</p>}
        </div>
      )}
    </div>
  );
};

export default BookCard;
