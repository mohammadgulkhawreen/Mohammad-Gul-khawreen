import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (user: {name: string, email: string, password?: string}) => void;
}

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 8) score++;
        if (pass.match(/[a-z]/)) score++;
        if (pass.match(/[A-Z]/)) score++;
        if (pass.match(/[0-9]/)) score++;
        if (pass.match(/[^a-zA-Z0-9]/)) score++;
        return score;
    };

    const strength = getStrength(password);
    const labels = ['Too Short', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const colors = ['bg-slate-300', 'bg-red-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const widths = ['w-0', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full'];

    const strengthIndex = password.length === 0 ? 0 : (password.length <= 8 ? 1 : strength);


    return (
        <div className="mt-1 h-4">
          {password.length > 0 && (
            <>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${colors[strengthIndex]} ${widths[strengthIndex]}`}></div>
              </div>
              <p className="text-xs text-right mt-1 font-semibold text-slate-500 dark:text-slate-400">
                  {labels[strengthIndex]}
              </p>
            </>
          )}
        </div>
    );
};


const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password || !email) {
      alert("Name, email, and password are required.");
      return;
    }
    if(password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    onRegister({ name, password, email });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-3">
        <i className="fas fa-user-plus"></i>
        Create Account
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="form-group flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold text-slate-700 dark:text-slate-300">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
         <div className="form-group flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
        <div className="form-group flex flex-col gap-2">
          <label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300">Password</label>
           <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-500 focus-within:border-indigo-600 transition bg-white dark:bg-slate-700">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 6 characters)"
              required
              className="flex-1 p-3 border-none bg-transparent focus:ring-0 text-slate-800 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:shadow-indigo-900/50 flex items-center justify-center gap-2 mt-2"
        >
          <i className="fas fa-user-plus"></i>
          Register
        </button>
      </form>
    </>
  );
};

export default RegisterForm;
