import React, { useState } from 'react';

interface ForgotPasswordFormProps {
    onForgotPasswordRequest: (email: string) => void;
    onResetPassword: (email: string, code: string, newPassword: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onForgotPasswordRequest, onResetPassword }) => {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code and new password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onForgotPasswordRequest(email);
        setStep(2); // Move to the next step
    };
    
    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        onResetPassword(email, code, newPassword);
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
                <i className="fas fa-key"></i>
                Reset Password
            </h2>
            {step === 1 ? (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                    <p className="text-slate-600 dark:text-slate-300">Enter your email address and we'll send you a code to reset your password.</p>
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
                        Send Reset Code
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
                     <p className="text-slate-600 dark:text-slate-300">A reset code has been sent to <span className="font-bold text-slate-800 dark:text-slate-100">{email}</span>. Please check your inbox (for this demo, the code will be shown in a toast message) and enter it below.</p>
                     <div className="form-group flex flex-col gap-2">
                        <label htmlFor="reset-code" className="font-semibold text-slate-700 dark:text-slate-300">Reset Code</label>
                        <input
                            type="text"
                            id="reset-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter the 6-digit code"
                            required
                            className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div className="form-group flex flex-col gap-2">
                        <label htmlFor="new-password" className="font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-500 focus-within:border-indigo-600 transition bg-white dark:bg-slate-700">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                                className="flex-1 p-3 border-none bg-transparent focus:ring-0 text-slate-800 dark:text-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    <div className="form-group flex flex-col gap-2">
                        <label htmlFor="confirm-password" className="font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-500 focus-within:border-indigo-600 transition bg-white dark:bg-slate-700">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                                className="flex-1 p-3 border-none bg-transparent focus:ring-0 text-slate-800 dark:text-slate-200"
                            />
                             <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                        <i className="fas fa-check-circle"></i>
                        Set New Password
                    </button>
                </form>
            )}
        </>
    );
};

export default ForgotPasswordForm;