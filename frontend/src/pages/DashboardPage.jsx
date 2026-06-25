import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout, { ProtectedRoute } from '../components/Layout';
import { StatCard, PageHeader, LoadingSpinner, SeverityBadge, DisasterIcon } from '../components/UI';
import { analyticsAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const quickActions = [
  { path: '/report', icon: '📢', label: 'Report Disaster', color: 'red' },
  { path: '/detect', icon: '🤖', label: 'AI Detection', color: 'orange' },
  { path: '/map', icon: '🗺️', label: 'Hazard Map', color: 'yellow' },
  { path: '/shelters', icon: '🏠', label: 'Find Shelters', color: 'green' },
  { path: '/assistant', icon: '💬', label: 'Emergency Help', color: 'blue' },
  { path: '/reports', icon: '📄', label: 'My Reports', color: 'red' },
];

function DashboardContent() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.get(), reportsAPI.list()])
      .then(([analyticsRes, reportsRes]) => {
        setAnalytics(analyticsRes.data);
        setRecentReports(reportsRes.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title={`Welcome, ${user?.full_name?.split(' ')[0] || 'User'}`}
        subtitle="Monitor disaster activity and access emergency tools"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Reports" value={analytics?.total_reports || 0} icon="📊" color="red" />
        <StatCard title="Active Shelters" value={analytics?.active_shelters || 0} icon="🏠" color="green" />
        <StatCard title="Shelter Capacity" value={analytics?.total_shelter_capacity || 0} icon="👥" color="blue" />
        <StatCard
          title="High Risk Reports"
          value={analytics?.severity_distribution?.High || 0}
          icon="⚠️"
          color="orange"
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="glass-card p-4 text-center hover:border-crisis-red/40 transition-all hover:-translate-y-1"
          >
            <span className="text-3xl">{action.icon}</span>
            <p className="text-sm font-medium mt-2">{action.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Disaster Reports</h2>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-crisis-border text-slate-400">
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Severity</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-crisis-border/50 hover:bg-slate-800/30">
                  <td className="p-4"><DisasterIcon type={report.disaster_type} /></td>
                  <td className="p-4 font-medium">{report.title}</td>
                  <td className="p-4 text-slate-400">{report.location_name}</td>
                  <td className="p-4"><SeverityBadge severity={report.severity} /></td>
                  <td className="p-4 text-slate-400">{new Date(report.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentReports.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No reports yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout><DashboardContent /></Layout>
    </ProtectedRoute>
  );
}
