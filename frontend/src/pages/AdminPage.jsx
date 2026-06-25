import { useEffect, useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import { PageHeader, LoadingSpinner, SeverityBadge } from '../components/UI';
import { adminAPI } from '../services/api';

function AdminContent() {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shelterForm, setShelterForm] = useState({
    name: '', address: '', latitude: '', longitude: '', capacity: '', contact_number: '', facilities: '',
  });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, sheltersRes, analyticsRes, usersRes] = await Promise.all([
        adminAPI.getReports(),
        adminAPI.getShelters(),
        adminAPI.getAnalytics(),
        adminAPI.getUserCount(),
      ]);
      setReports(reportsRes.data);
      setShelters(sheltersRes.data);
      setAnalytics(analyticsRes.data);
      setUserCount(usersRes.data.total_users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const deleteReport = async (id) => {
    if (!confirm('Mark this report as removed?')) return;
    await adminAPI.deleteReport(id);
    setMessage('Report removed');
    loadData();
  };

  const createShelter = async (e) => {
    e.preventDefault();
    await adminAPI.createShelter({
      ...shelterForm,
      latitude: parseFloat(shelterForm.latitude),
      longitude: parseFloat(shelterForm.longitude),
      capacity: parseInt(shelterForm.capacity),
    });
    setMessage('Shelter created');
    setShelterForm({ name: '', address: '', latitude: '', longitude: '', capacity: '', contact_number: '', facilities: '' });
    loadData();
  };

  const tabs = [
    { id: 'reports', label: 'Reports' },
    { id: 'shelters', label: 'Shelters' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'add-shelter', label: 'Add Shelter' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Admin Dashboard" subtitle="Manage disaster reports, shelters, and view platform analytics" />

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card"><p className="text-slate-400 text-sm">Total Users</p><p className="text-2xl font-bold">{userCount}</p></div>
        <div className="stat-card"><p className="text-slate-400 text-sm">Total Reports</p><p className="text-2xl font-bold">{analytics?.total_reports || 0}</p></div>
        <div className="stat-card"><p className="text-slate-400 text-sm">Active Shelters</p><p className="text-2xl font-bold">{analytics?.active_shelters || 0}</p></div>
        <div className="stat-card"><p className="text-slate-400 text-sm">High Risk</p><p className="text-2xl font-bold text-red-400">{analytics?.severity_distribution?.High || 0}</p></div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-crisis-red text-white' : 'bg-crisis-card border border-crisis-border text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crisis-border text-slate-400">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Reporter</th>
                <th className="text-left p-4">Severity</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-crisis-border/50">
                  <td className="p-4">{r.id}</td>
                  <td className="p-4">{r.title}</td>
                  <td className="p-4">{r.disaster_type || 'N/A'}</td>
                  <td className="p-4">{r.reporter_name}</td>
                  <td className="p-4"><SeverityBadge severity={r.severity} /></td>
                  <td className="p-4">{r.status}</td>
                  <td className="p-4">
                    {r.status === 'active' && (
                      <button onClick={() => deleteReport(r.id)} className="text-red-400 hover:text-red-300 text-xs">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'shelters' && (
        <div className="grid md:grid-cols-2 gap-4">
          {shelters.map((s) => (
            <div key={s.id} className="glass-card p-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{s.address}</p>
              <p className="text-sm mt-2">Capacity: {s.capacity} | Occupied: {s.current_occupancy}</p>
              <p className="text-sm">📞 {s.contact_number}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Reports by Type</h3>
            {Object.entries(analytics?.reports_by_type || {}).map(([type, count]) => (
              <div key={type} className="flex justify-between py-2 border-b border-crisis-border/50">
                <span>{type}</span>
                <span className="font-bold text-crisis-red">{count}</span>
              </div>
            ))}
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Severity Distribution</h3>
            {Object.entries(analytics?.severity_distribution || {}).map(([sev, count]) => (
              <div key={sev} className="flex justify-between py-2 border-b border-crisis-border/50">
                <span>{sev}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'add-shelter' && (
        <form onSubmit={createShelter} className="glass-card p-6 max-w-xl space-y-4">
          <input name="name" placeholder="Shelter Name" value={shelterForm.name} onChange={(e) => setShelterForm({ ...shelterForm, name: e.target.value })} className="input-field" required />
          <input name="address" placeholder="Address" value={shelterForm.address} onChange={(e) => setShelterForm({ ...shelterForm, address: e.target.value })} className="input-field" required />
          <div className="grid grid-cols-2 gap-4">
            <input name="latitude" placeholder="Latitude" value={shelterForm.latitude} onChange={(e) => setShelterForm({ ...shelterForm, latitude: e.target.value })} className="input-field" required />
            <input name="longitude" placeholder="Longitude" value={shelterForm.longitude} onChange={(e) => setShelterForm({ ...shelterForm, longitude: e.target.value })} className="input-field" required />
          </div>
          <input name="capacity" placeholder="Capacity" type="number" value={shelterForm.capacity} onChange={(e) => setShelterForm({ ...shelterForm, capacity: e.target.value })} className="input-field" required />
          <input name="contact_number" placeholder="Contact Number" value={shelterForm.contact_number} onChange={(e) => setShelterForm({ ...shelterForm, contact_number: e.target.value })} className="input-field" required />
          <input name="facilities" placeholder="Facilities" value={shelterForm.facilities} onChange={(e) => setShelterForm({ ...shelterForm, facilities: e.target.value })} className="input-field" />
          <button type="submit" className="btn-primary w-full">Create Shelter</button>
        </form>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <Layout><AdminContent /></Layout>
    </ProtectedRoute>
  );
}
