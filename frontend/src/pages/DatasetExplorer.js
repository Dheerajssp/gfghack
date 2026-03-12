import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, FileText, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

export const DatasetExplorer = () => {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [query, setQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setAnalysis(null);
    setAnswer('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/explorer/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAnalysis(response.data);
      toast.success('Dataset uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload dataset');
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!analysis) {
      toast.error('Please upload a dataset first');
      return;
    }

    setQueryLoading(true);
    try {
      const response = await axios.post(`${API}/explorer/query`, {
        datasetId: analysis.datasetId,
        query,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error querying dataset:', error);
      toast.error(error.response?.data?.detail || 'Failed to process question');
    } finally {
      setQueryLoading(false);
    }
  };

  const renderVisualization = (viz) => {
    if (viz.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viz.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fill: '#71717A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#71717A', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E4E4E7',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (viz.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={viz.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => entry.name}
            >
              {viz.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E4E4E7',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-zinc-950">
          Dataset Explorer
        </h1>
        <p className="mt-2 text-base text-zinc-600 leading-relaxed">
          Upload and analyze your CSV datasets with AI
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
        <label
          htmlFor="file-upload"
          data-testid="upload-dataset-button"
          className="flex flex-col items-center justify-center gap-4 cursor-pointer py-8 border-2 border-dashed border-zinc-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200"
        >
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              <p className="text-zinc-600 font-medium">Analyzing your dataset...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-emerald-100 rounded-full">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-900">Upload CSV Dataset</p>
                <p className="text-sm text-zinc-500 mt-1">Click to browse or drag and drop</p>
              </div>
            </>
          )}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Dataset Summary */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-zinc-900">{analysis.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {analysis.rows} rows • {analysis.columns} columns
                </p>
              </div>
            </div>
            <p className="text-base text-zinc-600 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Statistics */}
          {analysis.statistics && Object.keys(analysis.statistics).length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.statistics).map(([col, stats]) => (
                  <div key={col} className="p-4 bg-zinc-50 rounded-lg">
                    <p className="font-semibold text-zinc-900 mb-2">{col}</p>
                    <div className="space-y-1 text-sm text-zinc-600">
                      <div className="flex justify-between">
                        <span>Mean:</span>
                        <span className="font-mono">{stats.mean?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min:</span>
                        <span className="font-mono">{stats.min?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max:</span>
                        <span className="font-mono">{stats.max?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualizations */}
          {analysis.visualizations && analysis.visualizations.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Automatic Visualizations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.visualizations.map((viz, idx) => (
                  <div key={idx} className="p-4 border border-zinc-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-zinc-700 mb-3">{viz.title}</h4>
                    {renderVisualization(viz)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Section */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">
              Ask Questions About This Dataset
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="text"
                  data-testid="explorer-query-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="e.g., What are the top 5 values in the dataset?"
                  className="w-full h-14 pl-12 pr-4 text-base border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <button
                data-testid="explorer-query-button"
                onClick={handleQuery}
                disabled={queryLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {queryLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Ask AI'
                )}
              </button>
            </div>

            {/* Answer */}
            {answer && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-base text-zinc-700 leading-relaxed">{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};