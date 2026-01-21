/**
 * Header Component - Responsive
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CreditsDisplay from '../Credits/CreditsDisplay';

const Header = ({ title = 'Dashboard', onMenuToggle, showMenuButton = false }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button + Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          {showMenuButton && (
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
          
          {/* Logo */}
          <img src="/logo.jpg" alt="Logo Bạn của nhà nông" className="h-8 w-8 object-contain mr-2" />
          {/* Title */}
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{title}</h2>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Credits Display */}
          {isAuthenticated && (
            <CreditsDisplay />
          )}

          {/* Notifications - hide on very small screens */}
          <button className="hidden sm:flex relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings - hide on mobile */}
          <button className="hidden md:flex p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          {/* User Profile Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user?.full_name || 'Người dùng'}
                </span>
                <ChevronDown size={16} className={`hidden sm:block text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.phone}</p>
                    {user?.province && (
                      <p className="text-xs text-gray-500">{user?.province}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;
