import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

interface PaymentSettingsProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ settings, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  useEffect(() => {
    setApiKey(settings.binanceApiKey);
    setApiSecret(settings.binanceApiSecret);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ binanceApiKey: apiKey, binanceApiSecret: apiSecret });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
          <i className="fas fa-cog"></i>
          Payment Settings
        </h2>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-4">
            <i className="fa-brands fa-bitcoin text-3xl text-amber-500"></i>
            <div>
                 <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Binance Integration</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Enter your API credentials to enable automated payments.</p>
            </div>
        </div>
       
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="form-group flex flex-col gap-2">
                <label htmlFor="apiKey" className="font-semibold text-slate-700 dark:text-slate-300">API Key</label>
                <input
                    type="text"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Binance API Key"
                    className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                />
            </div>
            <div className="form-group flex flex-col gap-2">
                <label htmlFor="apiSecret" className="font-semibold text-slate-700 dark:text-slate-300">API Secret</label>
                <input
                    type="password"
                    id="apiSecret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter your Binance API Secret"
                    className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                />
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your API keys are stored locally in your browser and are not sent to any server.</p>
            </div>

            <div className="flex justify-end mt-2">
                <button
                    type="submit"
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:shadow-indigo-900/50 flex items-center justify-center gap-2"
                >
                    <i className="fas fa-save"></i>
                    Save Settings
                </button>
            </div>
        </form>
      </div>
    </>
  );
};

export default PaymentSettings;