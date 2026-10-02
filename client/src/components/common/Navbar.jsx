import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Camera, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Khám phá địa danh', path: '/places', icon: Compass },
    { name: 'Nhận diện AI', path: '/recognize', icon: Camera },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-sky-600 bg-clip-text text-transparent">
                  TravelAI
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase -mt-1">
                  Smart Tourism
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'text-brand-600 bg-brand-50 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1.5" />}
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User profile dropdown & action button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/recognize"
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-sm hover:opacity-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Thử AI Landmark
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all focus:outline-none"
                >
                  <img
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    src={user.avatarUrl || defaultAvatar}
                    alt={user.fullName || user.username || 'User avatar'}
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.fullName || user.username}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1.5 divide-y divide-gray-100 z-50">
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-400">Đăng nhập với</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-2.5 text-gray-500" />
                        Hồ sơ cá nhân
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 mr-1.5" />
                Hồ sơ của tôi
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 pt-2 pb-4 space-y-1 bg-white">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-lg ${
                  isActive(link.path)
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 mr-3" />}
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <User className="w-5 h-5 mr-3 text-gray-500" />
              Hồ sơ cá nhân
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
