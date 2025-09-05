import React, { useState, useRef, useEffect } from 'react';
import { Section, User } from '../types';

interface HeaderProps {
  onNavigate: (section: Section) => void;
  currentUser: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const NavLink: React.FC<{
  onClick: () => void;
  icon: string;
  label: string;
  className?: string;
}> = ({ onClick, icon, label, className = '' }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2 ${className}`}
    >
      <i className={`fas ${icon}`}></i>
      {label}
    </a>
  </li>
);

const Header: React.FC<HeaderProps> = ({ onNavigate, currentUser, onLogout, searchQuery, setSearchQuery, theme, toggleTheme }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  // If a search is initiated elsewhere (e.g. chatbot), show the search bar
  useEffect(() => {
    if (searchQuery) {
        setIsSearchVisible(true);
    }
  }, [searchQuery]);


  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchVisible(false);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 p-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Section.Books)}>
        <i className="fas fa-book-open text-emerald-500"></i>
        Khawreen Library
      </h1>
      <div className="flex items-center flex-wrap justify-center gap-x-2 gap-y-2 sm:flex-nowrap">
        <nav>
          <ul className="flex flex-wrap justify-center list-none gap-1 sm:gap-2 m-0 p-0">
            <NavLink onClick={() => onNavigate(Section.Books)} icon="fa-book" label="Books" />
            {currentUser && <NavLink onClick={() => onNavigate(Section.MyBooks)} icon="fa-folder-open" label="My Books" />}
            {currentUser && <NavLink onClick={() => onNavigate(Section.MyPurchases)} icon="fa-shopping-cart" label="My Purchases" />}
            {currentUser && <NavLink onClick={() => onNavigate(Section.Upload)} icon="fa-upload" label="Upload" />}
            {currentUser?.role === 'admin' && (
              <>
                 <NavLink
                  onClick={() => onNavigate(Section.Orders)}
                  icon="fa-receipt"
                  label="Orders"
                  className="bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-800/60"
                />
                <NavLink
                  onClick={() => onNavigate(Section.Admin)}
                  icon="fa-user-shield"
                  label="Admin Panel"
                  className="bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/60"
                />
                <NavLink
                  onClick={() => onNavigate(Section.AdsManager)}
                  icon="fa-bullhorn"
                  label="Manage Ads"
                  className="bg-cyan-100 text-cyan-800 border border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700 dark:hover:bg-cyan-800/60"
                />
                 <NavLink
                  onClick={() => onNavigate(Section.Settings)}
                  icon="fa-cog"
                  label="Settings"
                  className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600/60"
                />
              </>
            )}
          </ul>
        </nav>
        
        <div className="flex items-center gap-2">
            <div className={`flex items-center transition-all duration-300 ease-in-out ${isSearchVisible ? 'w-40 sm:w-48' : 'w-10'}`}>
                {isSearchVisible ? (
                     <div className="relative w-full">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search books..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={handleSearchBlur}
                            className="w-full py-2 pl-9 pr-3 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 focus:border-indigo-600 transition"
                        />
                         <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                     </div>
                ) : (
                    <button onClick={() => setIsSearchVisible(true)} className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label="Open search">
                        <i className="fas fa-search text-lg"></i>
                    </button>
                )}
            </div>
            
            <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
            </button>

            <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {currentUser.role === 'admin' && (
                    <div className="font-semibold text-sm text-slate-700 dark:text-slate-300 hidden lg:flex items-center gap-2">
                      <span>{currentUser.name}</span>
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">ADMIN</span>
                    </div>
                  )}
                  <button
                    onClick={onLogout}
                    title="Logout"
                    className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200 flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                 <ul className="flex flex-wrap justify-center list-none gap-2 sm:gap-4 m-0 p-0">
                    <NavLink onClick={() => onNavigate(Section.Register)} icon="fa-user-plus" label="Register" />
                    <NavLink onClick={() => onNavigate(Section.Login)} icon="fa-sign-in-alt" label="Login" />
                 </ul>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;