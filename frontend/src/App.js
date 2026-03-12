import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { DataCopilot } from './pages/DataCopilot';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { DataDetective } from './pages/DataDetective';
import { DecisionIntelligence } from './pages/DecisionIntelligence';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DataCopilot />} />
            <Route path="/explorer" element={<DatasetExplorer />} />
            <Route path="/detective" element={<DataDetective />} />
            <Route path="/decision" element={<DecisionIntelligence />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;