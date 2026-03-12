import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Upload, Search, Brain, BarChart3 } from 'lucide-react';

const modules = [
  { id: 'copilot', name: 'Data Copilot', icon: BarChart3, path: '/', gradient: 'from-violet-500 to-indigo-600' },
  { id: 'explorer', name: 'Dataset Explorer', icon: Upload, path: '/explorer', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'detective', name: 'Data Detective', icon: Search, path: '/detective', gradient: 'from-amber-400 to-orange-500', comingSoon: true },
  { id: 'decision', name: 'Decision Intelligence', icon: Brain, path: '/decision', gradient: 'from-rose-400 to-pink-500', comingSoon: true },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white border-r border-zinc-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-zinc-900">Data Intel</h1>
            <p className="text-xs text-zinc-500">AI Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = location.pathname === module.path;

          return (
            <Link
              key={module.id}
              to={module.path}
              data-testid={`nav-${module.id}`}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }
              `}
            >
              <div className={`
                p-2 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? `bg-gradient-to-br ${module.gradient} text-white`
                    : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200'
                }
              `}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{module.name}</div>
                {module.comingSoon && (
                  <div className="text-xs text-zinc-400">Coming Soon</div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200">
        <div className="text-xs text-zinc-400 text-center">
          Built with AI • v1.0
        </div>
      </div>
    </div>
  );
};