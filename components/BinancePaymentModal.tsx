import React from 'react';
import { Book, Purchase } from '../types';

interface BinancePaymentModalProps {
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


const BinancePaymentModal: React.FC<BinancePaymentModalProps> = ({ isOpen, onClose, onSuccess, purchase, book }) => {
  if (!isOpen || !purchase || !book) return null;

  const handleSimulatePayment = () => {
      // In a real app, you would wait for a webhook from Binance.
      // Here, we just simulate a successful payment immediately.
      onSuccess(purchase.id);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[95] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="binance-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 ease-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="binance-modal-title" className="text-xl sm:text-2xl font-bold text-amber-500 flex items-center gap-3">
            <i className="fa-brands fa-bitcoin"></i>
            Binance Pay
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300 text-center">Scan the QR code with your Binance App to complete the payment.</p>
            
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <InfoRow label="Book" value={book.title} />
              <InfoRow label="Amount" value={`${book.price} AFN`} />
              <InfoRow label="Reference" value={purchase.referenceCode} />
            </div>

            <div className="flex justify-center my-4">
                {/* Mock QR Code from an external service */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay:binance?coin=USDT&amount=${book.price}&ref=${purchase.referenceCode}&bgcolor=f1f5f9`} alt="Binance QR Code" className="w-48 h-48 rounded-lg border-4 border-slate-200 dark:border-slate-700" />
            </div>

             <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">For demonstration purposes:</p>
                <button
                    onClick={handleSimulatePayment}
                    className="w-full bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <i className="fas fa-check-circle"></i>
                    Simulate Successful Payment
                </button>
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">Once your payment is confirmed, the book will be automatically added to your 'My Purchases' section.</p>
        </div>
      </div>
    </div>
  );
};

export default BinancePaymentModal;