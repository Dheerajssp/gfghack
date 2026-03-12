import React, { useState } from 'react';
import { User, Globe, Palette, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setThemeMode } = useTheme();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || ''
  });
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analytics: true
  });

  const tabs = [
    { id: 'profile', name: t('profile'), icon: User },
    { id: 'language', name: t('language'), icon: Globe },
    { id: 'theme', name: t('appearance'), icon: Palette },
    { id: 'notifications', name: t('notifications'), icon: Bell },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  ];

  const handleSaveProfile = () => {
    toast.success(t('saveChanges'));
  };

  const handleSaveLanguage = () => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    const langName = languages.find(l => l.code === language)?.name;
    toast.success(`Language changed to ${langName}`);
  };

  const handleSaveTheme = () => {
    setThemeMode(selectedTheme);
    toast.success(`Theme changed to ${selectedTheme} mode`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-zinc-900">{t('settings')}</h1>
        <p className="text-zinc-600 mt-1">{t('manageSettings')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-zinc-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${
                      activeTab === tab.id
                        ? 'bg-violet-50 text-violet-700 font-medium'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={profile.username}
                        disabled
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-4">Language Preferences</h2>
                  <div className="space-y-3">
                    {languages.map((lang) => (
                      <label
                        key={lang.code}
                        className={`
                          flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                          ${
                            language === lang.code
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={lang.code}
                          checked={language === lang.code}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-4 h-4 text-violet-600"
                        />
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium text-zinc-900">{lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSaveLanguage}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Language
                </button>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-4">Appearance</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                        theme === 'light' ? 'border-violet-500 bg-violet-50' : 'border-zinc-200'
                      }`}>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={selectedTheme === 'light'}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-zinc-900">{t('lightMode')}</p>
                        <p className="text-sm text-zinc-600">{t('brightInterface')}</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                        selectedTheme === 'dark' ? 'border-violet-500 bg-violet-50' : 'border-zinc-200'
                      }`}>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={selectedTheme === 'dark'}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-zinc-900">{t('darkMode')}</p>
                        <p className="text-sm text-zinc-600">{t('easyOnEyes')}</p>
                      </div>
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleSaveTheme}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Theme
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium text-zinc-900">Email Notifications</p>
                        <p className="text-sm text-zinc-600">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                        className="w-5 h-5 text-violet-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium text-zinc-900">Push Notifications</p>
                        <p className="text-sm text-zinc-600">Get browser notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                        className="w-5 h-5 text-violet-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium text-zinc-900">Analytics Reports</p>
                        <p className="text-sm text-zinc-600">Weekly insights summary</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.analytics}
                        onChange={(e) => setNotifications({ ...notifications, analytics: e.target.checked })}
                        className="w-5 h-5 text-violet-600"
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => toast.success('Notification preferences saved!')}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};