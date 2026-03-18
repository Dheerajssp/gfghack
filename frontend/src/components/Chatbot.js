import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export const Chatbot = ({ module = 'general' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hi! I'm your AI assistant. I can help you with questions about ${module}. How can I help you today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call AI service for chat response
      const response = await api.post('/chat/ask', {
        message: input,
        context: module,
        history: messages.slice(-5) // Last 5 messages for context
      });

      const aiMessage = { 
        role: 'assistant', 
        content: response.data.answer 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback response if API fails
      const fallbackMessage = {
        role: 'assistant',
        content: `I understand you're asking: "${input}". ${getFallbackResponse(input, module)}`
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackResponse = (question, moduleType) => {
    const responses = {
      copilot: "For Data Copilot queries, try asking specific questions about your database like 'Show total sales by region' or 'Top 5 products by revenue'.",
      explorer: "For Dataset Explorer, you can upload CSV files and ask questions like 'What's the average value?' or 'Show me the distribution'.",
      detective: "For Data Detective, upload your dataset and use 'Detect Outliers' to find anomalies in your data.",
      decision: "For Decision Intelligence, I can help with forecasting and recommendations. Click 'Generate Recommendations' to get AI-powered insights."
    };
    
    return responses[moduleType] || "I'm here to help! Please try rephrasing your question or use the module features above.";
  };

  const quickQuestions = {
    copilot: [
      "How do I write a query?",
      "Show example queries",
      "What data is available?"
    ],
    explorer: [
      "How to upload CSV?",
      "What file format?",
      "How to analyze data?"
    ],
    detective: [
      "What are anomalies?",
      "How does detection work?",
      "Explain outliers"
    ],
    decision: [
      "How to forecast?",
      "What are recommendations?",
      "Explain what-if analysis"
    ]
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
          data-testid="chatbot-open-button"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              data-testid="chatbot-close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-2xl rounded-bl-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {(quickQuestions[module] || quickQuestions.copilot).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="chatbot-send-button"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
