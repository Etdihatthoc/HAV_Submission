/**
 * Sidebar Navigation Component - Responsive
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Map,
  History,
  UserCheck,
  Sprout,
  Upload,
  X
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Trang chủ', active: location.pathname === '/' },
    { path: '/chat', icon: MessageSquare, label: 'Chat AI', active: location.pathname === '/chat' },
    { path: '/crop-update', icon: Upload, label: 'Cập nhật cây trồng', active: location.pathname === '/crop-update' },
    { path: '/map', icon: Map, label: 'Bản đồ dịch bệnh', active: location.pathname === '/map' },
    { path: '/history', icon: History, label: 'Lịch sử', active: location.pathname === '/history' },
    { path: '/expert', icon: UserCheck, label: 'Chuyên gia', active: location.pathname.startsWith('/expert') },
    { path: '/animal-diagnosis', icon: Sprout, label: 'Chẩn đoán bệnh vật nuôi', active: location.pathname === '/animal-diagnosis' },
    { path: '/market', icon: LayoutDashboard, label: 'Chợ sản phẩm chăn nuôi', active: location.pathname === '/market' },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile after clicking a link
    if (onClose) onClose();
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-primary-700 to-primary-900 text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-primary-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-lg p-2">
              <img src="/logo.jpg" alt="Logo Bạn của nhà nông" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">Bạn của nhà nông</h1>
              <p className="text-xs text-primary-200 hidden md:block">Chẩn đoán thông minh</p>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-primary-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 md:px-4 py-4 md:py-6 space-y-1 md:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-white text-primary-700 shadow-lg'
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm md:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-primary-600 text-xs text-primary-200">
        <p>© 2026 Bạn của nhà nông</p>
        <p className="hidden md:block">RMIT University</p>
      </div>
    </div>
  );
};

export default Sidebar;
