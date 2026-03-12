import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, FileText, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const COLORS = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

export const DatasetExplorerModule = () => {
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

      const response = await api.post('/explorer/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAnalysis(response.data);
      toast.success('Dataset uploaded and analyzed!');
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
      const response = await api.post('/explorer/query', {
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
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={viz.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fill: '#71717A', fontSize: 11 }} />
            <YAxis tick={{ fill: '#71717A', fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (viz.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={viz.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {viz.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-zinc-900 mb-2">Dataset Explorer</h2>
        <p className="text-zinc-600">Upload and analyze your CSV datasets with AI</p>
      </div>

      {/* Upload Section */}
      <div>
        <label
          htmlFor="file-upload"
          data-testid="upload-dataset-button"
          className="flex flex-col items-center justify-center gap-3 cursor-pointer py-6 border-2 border-dashed border-zinc-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200"
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-zinc-600 font-medium">Analyzing your dataset...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900">Upload CSV Dataset</p>
                <p className="text-sm text-zinc-500 mt-1">Click to browse</p>
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
        <div className="space-y-5">
          {/* Dataset Summary */}
          <div className="bg-zinc-50 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <FileText className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-zinc-900">{analysis.name}</h3>
                <p className="text-sm text-zinc-500">
                  {analysis.rows} rows • {analysis.columns} columns
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 mt-2">{analysis.summary}</p>
          </div>

          {/* Visualizations */}
          {analysis.visualizations && analysis.visualizations.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-zinc-900 mb-3">Automatic Visualizations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {analysis.visualizations.map((viz, idx) => (
                  <div key={idx} className="p-4 border border-zinc-200 rounded-lg bg-white">
                    <h4 className="text-sm font-semibold text-zinc-700 mb-2">{viz.title}</h4>
                    {renderVisualization(viz)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Section */}
          <div className="bg-zinc-50 rounded-lg p-4">
            <h3 className="text-base font-semibold text-zinc-900 mb-3">
              Ask Questions About This Dataset
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  data-testid="explorer-query-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="e.g., What are the top 5 values?"
                  className="w-full h-11 pl-10 pr-3 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                data-testid="explorer-query-button"
                onClick={handleQuery}
                disabled={queryLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {queryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Ask AI'
                )}
              </button>
            </div>

            {/* Answer */}
            {answer && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-zinc-700">{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};