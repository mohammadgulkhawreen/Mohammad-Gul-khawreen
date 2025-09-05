import React from 'react';
import { Purchase, Book, User } from '../types';

interface OrderManagementProps {
  purchases: Purchase[];
  books: Book[];
  users: User[];
}

const OrderManagement: React.FC<OrderManagementProps> = ({ purchases, books, users }) => {

  const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title || 'Unknown Book';
  const getUserName = (userId: string) => users.find(u => u.username === userId)?.name || 'Unknown User';
  const getUserEmail = (userId: string) => users.find(u => u.username === userId)?.email || 'N/A';

  const pendingPurchases = purchases.filter(p => p.status === 'pending').sort((a,b) => b.createdAt - a.createdAt);
  const completedPurchases = purchases.filter(p => p.status === 'completed').sort((a,b) => b.createdAt - a.createdAt);


  const renderPurchaseRow = (purchase: Purchase, isPending: boolean) => (
      <div key={purchase.id} className={`p-4 rounded-lg shadow-sm border dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isPending ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
        <div className="flex-1 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-100">{getBookTitle(purchase.bookId)}</p>
            <div className="text-sm text-slate-500 dark:text-slate-400">
                <span>User: <strong className="text-slate-600 dark:text-slate-300">{getUserName(purchase.userId)}</strong> ({getUserEmail(purchase.userId)})</span>
            </div>
             <div className="text-sm text-slate-500 dark:text-slate-400">
                <span>Ref Code: <strong className="font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1 rounded">{purchase.referenceCode}</strong></span>
            </div>
             <div className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(purchase.createdAt).toLocaleString()}
            </div>
        </div>
        <div className="flex-shrink-0 self-end md:self-center">
            {isPending ? (
                <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 dark:bg-yellow-900/50 dark:text-yellow-300">
                    <i className="fas fa-hourglass-start"></i> Awaiting user payment via Binance
                </span>
            ) : (
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 dark:bg-green-900/50 dark:text-green-300">
                    <i className="fas fa-check-circle"></i> Completed
                </span>
            )}
        </div>
      </div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
        <i className="fas fa-receipt"></i>
        Orders Management
      </h2>
      
      <div className="space-y-6">
        <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Pending & In-Progress ({pendingPurchases.length})</h3>
            {pendingPurchases.length > 0 ? (
                <div className="space-y-4">
                    {pendingPurchases.map(p => renderPurchaseRow(p, true))}
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-5">No pending orders.</p>
            )}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Completed Orders ({completedPurchases.length})</h3>
             {completedPurchases.length > 0 ? (
                <div className="space-y-4">
                    {completedPurchases.map(p => renderPurchaseRow(p, false))}
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-5">No completed orders yet.</p>
            )}
        </div>
      </div>
    </>
  );
};

export default OrderManagement;