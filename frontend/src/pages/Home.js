import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Upload, Search, Brain, TrendingUp, Database, Clock, Award } from 'lucide-react';
import authService from '../services/authService';

export const Home = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const modules = [
    {
      id: 'copilot',
      name: 'Data Copilot',
      icon: BarChart3,
      gradient: 'from-violet-500 to-indigo-600',
      description: 'Ask questions about your data in natural language and get instant insights',
      path: '/copilot',
      stats: { queries: 127, accuracy: '94%' }
    },
    {
      id: 'explorer',
      name: 'Dataset Explorer',
      icon: Upload,
      gradient: 'from-emerald-400 to-teal-500',
      description: 'Upload CSV files and analyze datasets with automatic visualizations',
      path: '/explorer',
      stats: { datasets: 23, analyzed: '1.2M rows' }
    },
    {
      id: 'detective',
      name: 'Data Detective',
      icon: Search,
      gradient: 'from-amber-400 to-orange-500',
      description: 'Detect anomalies, outliers, and suspicious patterns using ML',
      path: '/detective',
      stats: { anomalies: 45, detected: '98%' }
    },
    {
      id: 'decision',
      name: 'Decision Intelligence',
      icon: Brain,
      gradient: 'from-rose-400 to-pink-500',
      description: 'AI-powered forecasting and business recommendations',
      path: '/decision',
      stats: { forecasts: 18, accuracy: '91%' }
    },
  ];

  const quickStats = [
    { label: 'Total Queries', value: '1,247', icon: Database, color: 'violet' },
    { label: 'Datasets Analyzed', value: '89', icon: Upload, color: 'emerald' },
    { label: 'Insights Generated', value: '2,341', icon: TrendingUp, color: 'blue' },
    { label: 'Accuracy Rate', value: '94.2%', icon: Award, color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-zinc-900 dark:text-white">
          Welcome back, {user?.full_name || user?.username}! 👋
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
          Your AI-powered data intelligence platform is ready to go
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              <p className="text-sm text-zinc-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-zinc-900 mb-4">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => navigate(module.path)}
                data-testid={`module-card-${module.id}`}
                className="bg-white rounded-xl border-2 border-zinc-200 hover:border-violet-500 p-6 cursor-pointer transition-all duration-200 hover:shadow-xl group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-zinc-900 mb-2">
                      {module.name}
                    </h3>
                    <p className="text-sm text-zinc-600 mb-4">{module.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      {Object.entries(module.stats).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                          <span className="capitalize">{key}:</span>
                          <span className="font-semibold text-zinc-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">Analyzed sales data for Q1 2024</p>
              <p className="text-xs text-zinc-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
            <Upload className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">Uploaded customer_data.csv</p>
              <p className="text-xs text-zinc-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
            <Search className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">Detected 12 anomalies in transaction data</p>
              <p className="text-xs text-zinc-500">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};