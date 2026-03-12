import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, Upload, Search, Brain, Settings as SettingsIcon, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import authService from '../services/authService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const Layout = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', name: t('dashboard'), icon: Home },
    { path: '/copilot', name: t('dataCopilot'), icon: BarChart3 },
    { path: '/explorer', name: t('datasetExplorer'), icon: Upload },
    { path: '/detective', name: t('dataDetective'), icon: Search },
    { path: '/decision', name: t('decisionIntelligence'), icon: Brain },
    { path: '/settings', name: t('settings'), icon: SettingsIcon },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">\n          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold text-zinc-900 dark:text-white">Data Intel</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 dark:text-zinc-300" /> : <Menu className="w-5 h-5 dark:text-zinc-300" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
              Built with AI • v2.0
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar - placeholder */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t('search')}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="relative ml-4">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                data-testid="user-menu-button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-50">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    {t('settings')}
                  </Link>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
                  <button
                    onClick={handleLogout}
                    data-testid="logout-button"
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50 dark:bg-zinc-900">
          {children}
        </main>
      </div>
    </div>
  );
};
