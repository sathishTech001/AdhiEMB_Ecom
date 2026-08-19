import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getInitials } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-sm">
          {getInitials(user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'A')}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">
            {user?.firstName || 'Admin'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {typeof user?.role === 'object' ? user.role.name : (user?.role || 'Administrator')}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800 dark:ring-slate-700 animate-scaleIn z-50">
          <div className="px-2 py-3 border-b border-slate-100 dark:border-slate-700 mb-2 sm:hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user?.firstName || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 truncate mt-1">
              {user?.email}
            </p>
          </div>
          
          <button
            onClick={() => handleNavigate('/profile')}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/50 transition-colors"
          >
            <User className="mr-3 h-4 w-4 text-slate-400" />
            Profile
          </button>
          
          <button
            onClick={() => handleNavigate('/settings')}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            Settings
          </button>
          
          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
