import React, { useState } from 'react';

interface ForgotPasswordFormProps {
    onForgotPasswordRequest: (email: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onForgotPasswordRequest }) => {
    const [email, setEmail] = useState('');

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onForgotPasswordRequest(email);
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
                <i className="fas fa-key"></i>
                Reset Password
            </h2>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                <p className="text-slate-600 dark:text-slate-300">Enter your email address and we'll send you a link to reset your password.</p>
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="reset-email" className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <input
                        type="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:shadow-indigo-900/50 flex items-center justify-center gap-2 mt-2"
                >
                    <i className="fas fa-paper-plane"></i>
                    Send Reset Link
                </button>
            </form>
        </>
    );
};

export default ForgotPasswordForm;