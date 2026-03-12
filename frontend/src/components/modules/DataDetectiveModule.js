import React, { useState } from 'react';
import { Search, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export const DataDetectiveModule = () => {
  const [file, setFile] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/detective/upload', formData);
      setDatasetId(response.data.dataset_id);
      setFile(selectedFile);
      toast.success('Dataset uploaded! Now detect anomalies.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload dataset');
    } finally {
      setUploading(false);
    }
  };

  const detectOutliers = async () => {
    if (!datasetId) {
      toast.error('Please upload a dataset first');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await api.post('/detective/analyze/outliers', {
        dataset_id: datasetId,
        analysis_type: 'outliers',
        options: { contamination: 0.1 }
      });

      setResult(response.data);
      toast.success(`Found ${response.data.statistics.outliers_found} outliers!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to detect outliers');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-zinc-900 mb-2">Data Detective</h2>
        <p className="text-zinc-600">Detect anomalies, outliers, and suspicious patterns</p>
      </div>

      {/* Upload */}
      <div>
        <label
          htmlFor="detective-upload"
          className="flex flex-col items-center justify-center gap-3 cursor-pointer py-6 border-2 border-dashed border-zinc-300 rounded-xl hover:border-amber-500 hover:bg-amber-50/50 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              <p className="text-zinc-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-amber-100 rounded-full">
                <Upload className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900">Upload CSV for Anomaly Detection</p>
                <p className="text-sm text-zinc-500 mt-1">{file ? file.name : 'Click to browse'}</p>
              </div>
            </>
          )}
        </label>
        <input id="detective-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Actions */}
      {datasetId && (
        <button
          onClick={detectOutliers}
          disabled={analyzing}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-3 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Detect Outliers
            </>
          )}
        </button>
      )}

      {/* Results */}
      {result && result.success && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-zinc-900">{result.statistics.total_records}</p>
              <p className="text-sm text-zinc-600">Total Records</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{result.statistics.outliers_found}</p>
              <p className="text-sm text-zinc-600">Outliers</p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-zinc-900">{result.statistics.outlier_percentage}%</p>
              <p className="text-sm text-zinc-600">Anomaly Rate</p>
            </div>
          </div>

          {/* Outliers Table */}
          {result.outliers && result.outliers.length > 0 && (
            <div className="bg-white rounded-lg border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-zinc-900">Detected Outliers (Top 10)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      {Object.keys(result.outliers[0]).slice(0, 5).map((key) => (
                        <th key={key} className="text-left px-3 py-2 font-semibold text-zinc-700">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.outliers.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-zinc-100">
                        {Object.values(row).slice(0, 5).map((value, i) => (
                          <td key={i} className="px-3 py-2 text-zinc-600">
                            {typeof value === 'number' ? value.toFixed(2) : String(value).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
