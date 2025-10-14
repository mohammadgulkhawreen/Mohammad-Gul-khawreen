import React, { useState, useMemo } from 'react';
import { Book, User, Review, Section } from '../types';
import StarRating from './StarRating';
import { useAuth } from '../AuthContext';

const Highlight: React.FC<{ text: string; highlight: string; }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/50 text-slate-900 dark:text-slate-100 rounded px-0.5 py-0">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

interface BookCardProps {
  book: Book;
  reviews: Review[];
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onDelete: (id: string) => void;
  onPurchase: (id: string) => void;
  onDownload?: (id: string) => void;
  showStatus?: boolean;
  onApprove?: (id: string) => void;
  onRequestSummary?: (id: string) => void;
  onRequestEdit?: (id: string) => void;
  onRequestPreview?: (id: string) => void;
  onNavigate?: (section: Section) => void;
  highlightQuery?: string;
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
      <h4 className="font-bold text-slate-700 dark:text-slate-200">Leave a Review</h4>
      <div>
          <StarRating rating={rating} onRatingChange={setRating} isInteractive={true} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
        rows={3}
      ></textarea>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="self-start bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all">
        Submit
      </button>
    </form>
  );
};


const BookCard: React.FC<BookCardProps> = ({ book, reviews, onAddReview, onDelete, onPurchase, onDownload, showStatus = false, onApprove, onRequestSummary, onRequestEdit, onRequestPreview, onNavigate, highlightQuery = '' }) => {
  const { currentUser } = useAuth();
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

  const isOwner = currentUser?.email === book.uploadedBy;
  const isAdmin = currentUser?.role === 'admin';
  const isForSale = book.isForSale && book.price > 0;
  const hasPurchased = currentUser?.purchasedBookIds?.includes(book.id) || false;

  const canRead = !isForSale || hasPurchased || isOwner || isAdmin;
  const canEdit = (isOwner || isAdmin) && onRequestEdit;
  const canDelete = isOwner || isAdmin;
  const canApprove = isAdmin && book.status === 'pending' && onApprove;
  
  const hasActions = canEdit || canDelete || canApprove;
  
  const userHasReviewed = currentUser && bookReviews.some(r => r.username === currentUser.email);

  const handleReadClick = () => {
    if (onDownload) {
      onDownload(book.id);
    }
  };

  const handleShare = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('book', book.id);

    const shareData = {
      title: book.title,
      text: `Check out this book: "${book.title}" by ${book.author} from Khawreen Library.`,
      url: shareUrl.toString(),
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            // Pashto for "Link copied! You can now share it anywhere."
            alert('د کتاب لینک کاپي شو! تاسو اوس کولی شئ دا په هر ځای کې شریک کړئ.'); 
        } catch (copyError) {
            console.error('Failed to copy link to clipboard:', copyError);
            // Fallback to a prompt if clipboard fails
            prompt(
                'کاپي کول ناکام شول. لطفا دا لینک په خپله کاپي کړئ:', // Copying failed. Please copy this link manually:
                shareData.url
            );
        }
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            if (error instanceof DOMException && error.name !== 'AbortError') {
                console.error('Web Share API failed:', error);
                await copyToClipboard();
            } else if (!(error instanceof DOMException)) {
                // Handle other potential errors that are not DOMExceptions
                console.error('An unexpected error occurred with Web Share API:', error);
                await copyToClipboard();
            } else {
                // Log AbortError for debugging but don't show an error to the user
                console.log('Share action was cancelled by the user.');
            }
        }
    } else {
        await copyToClipboard();
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-900/50">
      <div className="flex flex-col md:flex-row">
        <img src={book.coverUrl} alt={book.title} className="w-full h-48 md:h-auto md:w-40 object-contain bg-slate-100 dark:bg-slate-700" />
        <div className="p-5 flex flex-col flex-grow w-full">
          <div className="flex justify-between items-start mb-2">
              <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100"><Highlight text={book.title} highlight={highlightQuery} /></h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">by <Highlight text={book.author} highlight={highlightQuery} /></p>
              </div>
              {showStatus && statusBadge[book.status]}
          </div>

          <div className="flex items-center gap-2 mb-2">
              <StarRating rating={averageRating} />
              <span className="text-xs text-slate-500 dark:text-slate-400">({bookReviews.length} review{bookReviews.length !== 1 ? 's' : ''})</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded-full">{book.language}</span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded-full flex items-center gap-1">
                <i className="fas fa-download"></i>
                {book.downloadCount || 0}
            </span>
            {book.tags?.map(tag => (
              <span key={tag} className="text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full"><Highlight text={tag} highlight={highlightQuery} /></span>
            ))}
          </div>
          
          <div className="flex-grow"></div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto">
            {canRead ? (
              <>
                <a href={book.pdfUrl} onClick={handleReadClick} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 dark:hover:bg-sky-400 transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="fas fa-book-open"></i> Read Online
                </a>
                <a href={book.pdfUrl} onClick={handleReadClick} download={book.pdfFileName} className="flex-1 text-center bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="fas fa-download"></i> Download
                </a>
              </>
            ) : (
              <button onClick={() => onPurchase(book.id)} className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                <i className="fas fa-shopping-cart"></i> Get ({isForSale ? `${book.price} AFN` : 'Free'})
              </button>
            )}
            
            <button onClick={handleShare} title="Share Book" className="w-full sm:w-auto bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2">
                <i className="fas fa-share-alt"></i> <span className="sm:hidden">Share</span>
            </button>

            {onRequestPreview && (
                <button onClick={() => onRequestPreview(book.id)} title="Preview Book" className="w-full sm:w-auto bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="fas fa-eye"></i> <span className="sm:hidden">Preview</span>
                </button>
            )}

            {onRequestSummary && (
                <button onClick={() => onRequestSummary(book.id)} title="Summarize with AI" className="w-full sm:w-auto bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="fas fa-magic"></i> <span className="sm:hidden">Summarize</span>
                </button>
            )}
            
            <button onClick={() => setShowReviews(!showReviews)} title="View Reviews" className="w-full sm:w-auto bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2">
              <i className={`fas ${showReviews ? 'fa-comment-slash' : 'fa-comments'}`}></i> <span className="sm:hidden">Reviews</span>
            </button>
          </div>

          {hasActions && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
              {canApprove && <button onClick={() => onApprove(book.id)} className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 py-1 px-3 rounded text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-800/60">Approve</button>}
              {canEdit && <button onClick={() => onRequestEdit(book.id)} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 py-1 px-3 rounded text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-800/60">Edit</button>}
              {canDelete && <button onClick={() => onDelete(book.id)} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 py-1 px-3 rounded text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800/60">Delete</button>}
            </div>
          )}
        </div>
      </div>
      
      {showReviews && (
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 animate-fade-in">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">{bookReviews.length > 0 ? 'Reviews' : 'No reviews yet'}</h4>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {bookReviews.map(review => (
              <div key={review.id} className="pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{review.username}</span>
                    <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{review.comment}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {currentUser && canRead && !userHasReviewed &&
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <ReviewForm bookId={book.id} onAddReview={onAddReview} />
            </div>
          }
          {!currentUser && onNavigate && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Section.Login); }} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Login</a> to leave a review.
                </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCard;