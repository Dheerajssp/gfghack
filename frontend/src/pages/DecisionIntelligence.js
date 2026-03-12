import React from 'react';
import { Brain } from 'lucide-react';

export const DecisionIntelligence = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1765046255478-55efc763637c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwbWluaW1hbHxlbnwwfHx8fDE3NzMzMzU1NzV8MA&ixlib=rb-4.1.0&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-white/90 backdrop-blur-md border border-white/20 p-12 text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900 mb-4">
              Decision Intelligence
            </h1>
            <p className="text-base text-zinc-600 mb-4">
              AI-powered business recommendations and predictive analytics.
            </p>
            <div className="inline-block px-6 py-2 bg-rose-100 text-rose-800 rounded-full text-sm font-semibold">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};