import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

export const DataCopilot = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/copilot/query`, { query });
      setResult(response.data);
      toast.success('Query processed successfully!');
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error(error.response?.data?.detail || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!result || !result.data || result.data.length === 0) return null;

    const { chartType, xAxis, yAxis } = result.chartConfig;
    const chartData = result.data;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
              <XAxis dataKey={xAxis} tick={{ fill: '#71717A', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717A', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E4E4E7',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey={yAxis} fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
              <XAxis dataKey={xAxis} tick={{ fill: '#71717A', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717A', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E4E4E7',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line type="monotone" dataKey={yAxis} stroke="#7C3AED" strokeWidth={2} dot={{ fill: '#7C3AED', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={yAxis}
                nameKey={xAxis}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => entry[xAxis]}
              >
                {chartData.map((entry, index) => (
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

      default:
        return <div className="text-zinc-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-zinc-950">
          Data Copilot
        </h1>
        <p className="mt-2 text-base text-zinc-600 leading-relaxed">
          Ask questions about your data in natural language
        </p>
      </div>

      {/* Query Input */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          <div className="relative">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-600" />
            <input
              type="text"
              data-testid="copilot-query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="e.g., Show monthly sales revenue by region"
              className="w-full h-14 pl-12 pr-4 text-base border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 shadow-sm"
            />
          </div>
          <button
            data-testid="copilot-query-button"
            onClick={handleQuery}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Ask AI'
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* SQL Query */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Generated SQL
            </h3>
            <code className="block p-4 bg-zinc-50 rounded-lg text-sm font-mono text-zinc-900 overflow-x-auto">
              {result.sql}
            </code>
          </div>

          {/* Chart */}
          {result.data && result.data.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                Visualization
              </h3>
              {renderChart()}
            </div>
          )}

          {/* Insights */}
          {result.insights && (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-violet-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                    AI Insights
                  </h3>
                  <p className="text-base text-zinc-600 leading-relaxed">
                    {result.insights}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {result.data && result.data.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                Data ({result.data.length} rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      {Object.keys(result.data[0]).map((key) => (
                        <th key={key} className="text-left px-4 py-3 font-semibold text-zinc-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-3 text-zinc-600">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.data.length > 10 && (
                  <div className="text-center py-3 text-sm text-zinc-500">
                    Showing 10 of {result.data.length} rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};