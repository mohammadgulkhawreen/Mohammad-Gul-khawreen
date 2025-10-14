import React, { useState } from 'react';
import { Book, Purchase } from '../types';

interface MobilePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (purchaseId: string) => void;
  purchase: Purchase | null;
  book: Book | undefined;
}

const InfoRow: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-600 last:border-b-0">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-right">{value}</span>
    </div>
);

const MobilePaymentModal: React.FC<MobilePaymentModalProps> = ({ isOpen, onClose, onSuccess, purchase, book }) => {
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !purchase || !book) return null;

  const merchantNumber = '0780 123 456';

  const handleCopy = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate sending payment request and automatic confirmation
    setTimeout(() => {
        if(purchase) {
            onSuccess(purchase.id);
        }
        setIsProcessing(false);
    }, 2000); 
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[95] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 ease-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="mobile-modal-title" className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
            <i className="fas fa-mobile-alt"></i>
            Pay with Mobile
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleConfirm} className="space-y-4 animate-fade-in">
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <InfoRow label="Book" value={book.title} />
              <InfoRow label="Amount" value={`${book.price} AFN`} />
              <InfoRow label="Reference" value={purchase.referenceCode} />
            </div>
            
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg border border-indigo-200 dark:border-indigo-500/50 space-y-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-2">
                    <li>Send <strong className="text-indigo-700 dark:text-indigo-300">{book.price} AFN</strong> to this number:</li>
                    <li className="list-none ml-4">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-700 p-2 rounded-md">
                           <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100">{merchantNumber}</span>
                           <button type="button" onClick={handleCopy} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                             {copied ? 'Copied!' : 'Copy'}
                           </button>
                        </div>
                    </li>
                    <li>After payment, enter the transaction ID you receive below.</li>
                </ol>
            </div>

            <input 
                type="text" 
                value={transactionId} 
                onChange={e => setTransactionId(e.target.value)} 
                placeholder="Enter Transaction ID" 
                required 
                className="p-3 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            />
            
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait"
                >
                     {isProcessing ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Confirming Payment...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check-circle"></i> Confirm Payment
                        </>
                    )}
                </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2">This is a simulated transaction. Any transaction ID will be accepted for confirmation.</p>
        </form>
      </div>
    </div>
  );
};

export default MobilePaymentModal;