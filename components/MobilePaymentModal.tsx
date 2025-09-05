import React, { useState } from 'react';
import { Book, Purchase } from '../types';

interface MobilePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (purchaseId: string) => void;
  purchase: Purchase | null;
  book: Book | undefined;
}

const MobilePaymentModal: React.FC<MobilePaymentModalProps> = ({ isOpen, onClose, onSuccess, purchase, book }) => {
  const [step, setStep] = useState(1); // 1: Enter number, 2: Confirm
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);


  if (!isOpen || !purchase || !book) return null;

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate sending request
    setTimeout(() => {
        setIsProcessing(false);
        setStep(2);
    }, 1500); 
  };
  
  const handleConfirm = () => {
      setIsProcessing(true);
      setTimeout(() => {
          onSuccess(purchase.id);
          setIsProcessing(false);
      }, 1000)
  }

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
        
        {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4 animate-fade-in">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Enter your mobile number to purchase <strong className="text-slate-700 dark:text-slate-200">"{book.title}"</strong> for <strong className="text-slate-700 dark:text-slate-200">{book.price} AFN</strong>.</p>
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="e.g. 0780000000" required className="p-3 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"/>
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait"
                    >
                         {isProcessing ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Sending...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i> Send Payment Request
                            </>
                        )}
                    </button>
                </div>
            </form>
        )}

         {step === 2 && (
            <div className="space-y-4 text-center animate-fade-in">
                <i className="fas fa-check-circle text-5xl text-emerald-500 dark:text-emerald-400"></i>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Request Sent!</h3>
                <p className="text-slate-600 dark:text-slate-300">A payment confirmation prompt has been sent to <strong className="text-slate-700 dark:text-slate-200">{phoneNumber}</strong>. Please approve the transaction on your phone.</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">For demonstration purposes, click below to confirm:</p>
                <div className="pt-2">
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait"
                    >
                         {isProcessing ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                           "I've Approved on My Phone"
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MobilePaymentModal;