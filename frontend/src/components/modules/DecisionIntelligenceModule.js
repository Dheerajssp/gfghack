import React, { useState } from 'react';
import { Brain, TrendingUp, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export const DecisionIntelligenceModule = () => {
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = () => {
    const mockRecs = {
      success: true,
      recommendations: [
        {
          type: 'trend',
          priority: 'high',
          insight: 'Sales showing upward trend in Q1 2024',
          action: 'Increase inventory to meet projected demand'
        },
        {
          type: 'opportunity',
          priority: 'medium',
          insight: 'Laptop category shows 25% higher margins',
          action: 'Focus marketing efforts on high-margin products'
        },
        {
          type: 'correlation',
          priority: 'medium',
          insight: 'Strong correlation between region and revenue',
          action: 'Expand operations in high-performing regions'
        }
      ]
    };
    setRecommendations(mockRecs);
    toast.success('Recommendations generated!');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-zinc-900 mb-2">Decision Intelligence</h2>
        <p className="text-zinc-600">AI-powered business recommendations and predictive analytics</p>
      </div>

      {/* Action */}
      <button
        onClick={generateRecommendations}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2"
      >
        <Lightbulb className="w-5 h-5" />
        Generate Business Recommendations
      </button>

      {/* Recommendations */}
      {recommendations && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-900">AI-Powered Recommendations</h3>
          {recommendations.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-zinc-200 p-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500">{rec.type}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 mb-1">{rec.insight}</p>
                  <p className="text-sm text-zinc-600">→ {rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
