import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Layout } from './components/Layout';
import { DataCopilotModule } from './components/modules/DataCopilotModule';
import { DatasetExplorerModule } from './components/modules/DatasetExplorerModule';
import { DataDetectiveModule } from './components/modules/DataDetectiveModule';
import { DecisionIntelligenceModule } from './components/modules/DecisionIntelligenceModule';
import authService from './services/authService';
import './i18n/i18n'; // Import i18n configuration

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Wrapper components for modules to add page headers
const DataCopilotPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="text-3xl font-heading font-bold text-zinc-900">Data Copilot</h1>
      <p className="text-zinc-600 mt-1">Ask questions about your data in natural language</p>
    </div>
    <DataCopilotModule />
  </div>
);

const DatasetExplorerPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="text-3xl font-heading font-bold text-zinc-900">Dataset Explorer</h1>
      <p className="text-zinc-600 mt-1">Upload and analyze your CSV datasets with AI</p>
    </div>
    <DatasetExplorerModule />
  </div>
);

const DataDetectivePage = () => (
  <div>
    <div className="mb-6">
      <h1 className="text-3xl font-heading font-bold text-zinc-900">Data Detective</h1>
      <p className="text-zinc-600 mt-1">Detect anomalies, outliers, and suspicious patterns</p>
    </div>
    <DataDetectiveModule />
  </div>
);

const DecisionIntelligencePage = () => (
  <div>
    <div className="mb-6">
      <h1 className="text-3xl font-heading font-bold text-zinc-900">Decision Intelligence</h1>
      <p className="text-zinc-600 mt-1">AI-powered forecasting and business recommendations</p>
    </div>
    <DecisionIntelligenceModule />
  </div>
);

function App() {
  // Initialize authentication on app load
  React.useEffect(() => {
    authService.initializeAuth();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/copilot" element={<ProtectedRoute><DataCopilotPage /></ProtectedRoute>} />
          <Route path="/explorer" element={<ProtectedRoute><DatasetExplorerPage /></ProtectedRoute>} />
          <Route path="/detective" element={<ProtectedRoute><DataDetectivePage /></ProtectedRoute>} />
          <Route path="/decision" element={<ProtectedRoute><DecisionIntelligencePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
