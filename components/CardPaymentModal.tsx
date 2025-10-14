import React, { useState } from 'react';
import { Book, Purchase } from '../types';

interface CardPaymentModalProps {
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

const CardPaymentModal: React.FC<CardPaymentModalProps> = ({ isOpen, onClose, onSuccess, purchase, book }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  if (!isOpen || !purchase || !book) return null;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call to a payment gateway and automatic confirmation
    setTimeout(() => {
        if(purchase) {
            onSuccess(purchase.id);
        }
        setIsProcessing(false);
    }, 2000); 
  };
  
  const formatCardNumber = (value: string) => value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  const formatExpiry = (value: string) => value.replace(/[^0-9]/g, '').replace(/^([2-9])$/g, '0$1').replace(/^(1{1})([3-9]{1})$/g, '01/$2').replace(/^0{1,}/g, '0').replace(/^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, '$1/$2');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[95] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 ease-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="card-modal-title" className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
            <i className="fas fa-credit-card"></i>
            Pay with Card
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleProcessPayment} className="space-y-4 animate-fade-in">
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <InfoRow label="Book" value={book.title} />
              <InfoRow label="Amount" value={`${book.price} AFN`} />
              <InfoRow label="Reference" value={purchase.referenceCode} />
            </div>

            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name on Card" required className="p-3 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"/>
            <input type="text" value={formatCardNumber(cardNumber)} onChange={e => setCardNumber(e.target.value)} placeholder="Card Number" maxLength={19} required className="p-3 w-full border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"/>
            <div className="flex gap-4">
                <input type="text" value={formatExpiry(expiry)} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} required className="p-3 w-1/2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"/>
                <input type="text" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="CVC" maxLength={4} required className="p-3 w-1/2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"/>
            </div>
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait"
                >
                    {isProcessing ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Processing...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-lock"></i> Pay {book.price} AFN
                        </>
                    )}
                </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2">This is a simulated transaction. No real card will be charged.</p>
        </form>
      </div>
    </div>
  );
};

export default CardPaymentModal;