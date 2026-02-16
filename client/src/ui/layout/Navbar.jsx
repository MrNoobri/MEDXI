import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Activity, Settings, Sun, Moon, LogOut, User, Bell } from 'lucide-react';
import { Button } from '../shared/Button';
import { useTheme } from '../shared/ThemeProvider';

export default function Navbar({ userName, onLogoClick, onSignOut, unreadCount = 0 }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span 
            className="text-3xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onLogoClick?.()}
          >
            <span className="text-indigo-600 dark:text-indigo-400">MED</span>
            <span className="text-blue-500 dark:text-blue-400">XI</span>
          </span>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/dashboard')}>
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/stats')}>
              <Activity className="w-4 h-4" />
              Stats
            </Button>
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          
          {unreadCount > 0 && (
            <Button variant="ghost" size="icon" className="relative" aria-label={`${unreadCount} unread notifications`}>
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            </Button>
          )}
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} aria-label="Settings">
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* User Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <User className="w-5 h-5" />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Patient</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut?.();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
