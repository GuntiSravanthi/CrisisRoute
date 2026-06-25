import { useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import { PageHeader, SeverityBadge } from '../components/UI';
import { reportsAPI } from '../services/api';

function ReportContent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    latitude: '19.0760',
    longitude: '72.8777',
    location_name: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm({
          ...form,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }),
        () => setError('Unable to get location. Enter coordinates manually.')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (image) formData.append('image', image);

    try {
      const res = await reportsAPI.create(formData);
      setSuccess(res.data);
      setForm({ title: '', description: '', latitude: '19.0760', longitude: '72.8777', location_name: '' });
      setImage(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Report a Disaster" subtitle="Submit disaster details with location and image for AI analysis" />

      {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {success && (
        <div className="mb-6 glass-card p-6 border-green-500/30">
          <h3 className="font-semibold text-green-400 mb-2">Report Submitted Successfully!</h3>
          <div className="flex items-center gap-4 text-sm">
            <span>AI Detected: <strong>{success.disaster_type || 'Pending'}</strong></span>
            {success.confidence && <span>Confidence: {(success.confidence * 100).toFixed(1)}%</span>}
            {success.severity && <SeverityBadge severity={success.severity} />}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Brief disaster title" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input-field min-h-[120px]" placeholder="Describe the disaster situation in detail..." required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Location Name</label>
          <input name="location_name" value={form.location_name} onChange={handleChange} className="input-field" placeholder="City, Area, Landmark" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Latitude</label>
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Longitude</label>
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <button type="button" onClick={getLocation} className="btn-secondary text-sm">
          📍 Use My Current Location
        </button>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Disaster Image</label>
          <input type="file" accept="image/*" onChange={handleImage} className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-crisis-red file:text-white file:cursor-pointer" />
          {preview && (
            <img src={preview} alt="Preview" className="mt-3 rounded-xl max-h-48 object-cover border border-crisis-border" />
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
          {loading ? 'Submitting & Analyzing...' : 'Submit Disaster Report'}
        </button>
      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <Layout><ReportContent /></Layout>
    </ProtectedRoute>
  );
}
