import React from 'react';

interface SummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  summary: string;
  isLoading: boolean;
  error: string;
}

const SummarizeModal: React.FC<SummarizeModalProps> = ({ isOpen, onClose, bookTitle, summary, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[90] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all duration-300 ease-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="summary-modal-title" className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Summary for: <span className="text-slate-800 dark:text-slate-100">{bookTitle}</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {isLoading && (
            <div className="text-center py-10">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 dark:text-indigo-400 mb-4"></i>
              <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg">Generating summary...</p>
              <p className="text-slate-500 dark:text-slate-400">This may take a moment.</p>
            </div>
          )}
          {error && (
            <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-700 dark:text-red-300 font-semibold text-lg">An Error Occurred</p>
              <p className="text-red-600 dark:text-red-400 mt-2 text-sm">{error}</p>
            </div>
          )}
          {summary && (
            <div dir="rtl" className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-right dark:prose-invert">
              <p>{summary}</p>
            </div>
          )}
        </div>

        <div className="mt-6 border-t pt-4 border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummarizeModal;