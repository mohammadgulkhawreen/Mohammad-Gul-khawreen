import React from 'react';
import { Book, Purchase, PaymentMethod } from '../types';

interface PaymentMethodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod, purchase: Purchase) => void;
  purchase: Purchase | null;
  book: Book | undefined;
}

const MethodButton: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
        <i className={`fas ${icon} text-2xl text-indigo-500 dark:text-indigo-400 w-8 text-center`}></i>
        <span className="ml-4 font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <i className="fas fa-chevron-right text-slate-400 dark:text-slate-500 ml-auto"></i>
    </button>
);


const PaymentMethodSelectionModal: React.FC<PaymentMethodSelectionModalProps> = ({ isOpen, onClose, onSelectMethod, purchase, book }) => {
  if (!isOpen || !purchase || !book) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[90] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-select-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 ease-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="payment-select-modal-title" className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Choose Payment Method
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-center">
                <p className="text-slate-600 dark:text-slate-300">You are purchasing:</p>
                <p className="font-bold text-xl text-slate-800 dark:text-slate-100">"{book.title}"</p>
                <p className="font-bold text-2xl text-emerald-600 dark:text-emerald-400 mt-1">{book.price} AFN</p>
            </div>

            <div className="space-y-3">
                 <MethodButton 
                    icon="fa-brands fa-bitcoin"
                    label="Binance Pay"
                    onClick={() => onSelectMethod(PaymentMethod.Binance, purchase)}
                 />
                 <MethodButton 
                    icon="fa-credit-card"
                    label="Bank Card"
                    onClick={() => onSelectMethod(PaymentMethod.Card, purchase)}
                 />
                 <MethodButton 
                    icon="fa-mobile-alt"
                    label="Mobile Money"
                    onClick={() => onSelectMethod(PaymentMethod.Mobile, purchase)}
                 />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelectionModal;