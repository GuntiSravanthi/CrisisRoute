import { useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import { PageHeader, SeverityBadge } from '../components/UI';
import { reportsAPI } from '../services/api';

const CLASS_COLORS = {
  Flood: '#3B82F6',
  Fire: '#DC2626',
  Landslide: '#A16207',
  'Cyclone Damage': '#7C3AED',
  'Earthquake Damage': '#64748B',
};

function DetectContent() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await reportsAPI.detect(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="AI Disaster Detection"
        subtitle="Upload an image to classify disaster type using PyTorch MobileNetV2 transfer learning"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Upload Image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-crisis-red file:text-white"
          />

          {preview ? (
            <img src={preview} alt="Upload" className="mt-4 rounded-xl w-full max-h-64 object-cover border border-crisis-border" />
          ) : (
            <div className="mt-4 h-64 rounded-xl border-2 border-dashed border-crisis-border flex items-center justify-center text-slate-500">
              No image selected
            </div>
          )}

          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleDetect}
            disabled={!image || loading}
            className="btn-primary w-full mt-4 py-3 disabled:opacity-50"
          >
            {loading ? 'Analyzing with AI...' : 'Detect Disaster Type'}
          </button>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Detection Results</h3>

          {result ? (
            <div>
              <div className="text-center p-6 rounded-xl bg-slate-800/50 mb-6">
                <p className="text-slate-400 text-sm">Detected Type</p>
                <p className="text-3xl font-bold mt-1 text-white">{result.disaster_type}</p>
                <p className="text-5xl font-extrabold mt-2 bg-gradient-to-r from-crisis-red to-crisis-orange bg-clip-text text-transparent">
                  {(result.confidence * 100).toFixed(1)}%
                </p>
                <div className="mt-3"><SeverityBadge severity={result.severity} /></div>
              </div>

              <h4 className="text-sm font-medium text-slate-400 mb-3">All Class Probabilities</h4>
              <div className="space-y-3">
                {Object.entries(result.all_predictions).map(([cls, prob]) => (
                  <div key={cls}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cls}</span>
                      <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${prob * 100}%`, background: CLASS_COLORS[cls] || '#DC2626' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 py-20">
              Upload an image and run detection
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6 mt-6">
        <h3 className="font-semibold mb-2">How It Works</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          CrisisRoute uses MobileNetV2 with transfer learning (ImageNet pretrained weights) fine-tuned
          for 5 disaster classes. OpenCV extracts visual features (color ratios, edge density, saturation)
          to enhance predictions. The model outputs disaster type, confidence score, and severity level
          (High ≥75%, Medium ≥45%, Low &lt;45%).
        </p>
      </div>
    </div>
  );
}

export default function DetectPage() {
  return (
    <ProtectedRoute>
      <Layout><DetectContent /></Layout>
    </ProtectedRoute>
  );
}
