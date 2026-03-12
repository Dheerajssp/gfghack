import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Upload, Search, Brain, User, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import authService from '../services/authService';

// Import module components
import { DataCopilotModule } from '../components/modules/DataCopilotModule';
import { DatasetExplorerModule } from '../components/modules/DatasetExplorerModule';
import { DataDetectiveModule } from '../components/modules/DataDetectiveModule';
import { DecisionIntelligenceModule } from '../components/modules/DecisionIntelligenceModule';

export const Dashboard = () => {
  const [activeModule, setActiveModule] = useState('copilot');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const modules = [
    { id: 'copilot', name: 'Data Copilot', icon: BarChart3, gradient: 'from-violet-500 to-indigo-600', description: 'Ask questions in natural language' },
    { id: 'explorer', name: 'Dataset Explorer', icon: Upload, gradient: 'from-emerald-400 to-teal-500', description: 'Upload and analyze CSV files' },
    { id: 'detective', name: 'Data Detective', icon: Search, gradient: 'from-amber-400 to-orange-500', description: 'Detect anomalies and patterns' },
    { id: 'decision', name: 'Decision Intelligence', icon: Brain, gradient: 'from-rose-400 to-pink-500', description: 'Forecasting and predictions' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-zinc-900">AI Data Intelligence</h1>
                <p className="text-xs text-zinc-500">Professional Analytics Platform</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                data-testid="user-menu-button"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-900">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-zinc-500">{user?.email}</p>
                </div>
                {userMenuOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 py-2">
                  <button
                    onClick={handleLogout}
                    data-testid="logout-button"
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-heading font-bold text-zinc-900">
            Welcome back, {user?.full_name || user?.username}!
          </h2>
          <p className="text-zinc-600 mt-1">Select a module below to get started with AI-powered data analysis</p>
        </div>

        {/* Module Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;

            return (
              <button
                key={module.id}
                data-testid={`module-card-${module.id}`}
                onClick={() => setActiveModule(module.id)}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-200 text-left
                  ${
                    isActive
                      ? 'border-violet-500 bg-violet-50 shadow-lg'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-lg bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-4
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">{module.name}</h3>
                <p className="text-sm text-zinc-600">{module.description}</p>
              </button>
            );
          })}
        </div>

        {/* Active Module Content */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          {activeModule === 'copilot' && <DataCopilotModule />}
          {activeModule === 'explorer' && <DatasetExplorerModule />}
          {activeModule === 'detective' && <DataDetectiveModule />}
          {activeModule === 'decision' && <DecisionIntelligenceModule />}
        </div>
      </div>
    </div>
  );
};
