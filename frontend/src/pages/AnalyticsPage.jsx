import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import Layout, { ProtectedRoute } from '../components/Layout';
import { StatCard, PageHeader, LoadingSpinner } from '../components/UI';
import { analyticsAPI } from '../services/api';

const SEVERITY_COLORS = { High: '#DC2626', Medium: '#EA580C', Low: '#EAB308', Unknown: '#64748B' };
const TYPE_COLORS = ['#DC2626', '#EA580C', '#EAB308', '#3B82F6', '#8B5CF6', '#64748B'];

function AnalyticsContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const typeData = Object.entries(data?.reports_by_type || {}).map(([name, value]) => ({ name, value }));
  const severityData = Object.entries(data?.severity_distribution || {}).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name] || '#64748B',
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Analytics Dashboard" subtitle="Disaster trends, severity distribution, and monthly report statistics" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Reports" value={data?.total_reports || 0} icon="📊" color="red" />
        <StatCard title="Disaster Types" value={typeData.length} icon="🌪️" color="orange" />
        <StatCard title="Active Shelters" value={data?.active_shelters || 0} icon="🏠" color="green" />
        <StatCard title="Total Capacity" value={data?.total_shelter_capacity || 0} icon="👥" color="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Reports by Disaster Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {severityData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Monthly Reports Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.monthly_reports || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94A3B8' }} />
            <YAxis tick={{ fill: '#94A3B8' }} />
            <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={2} dot={{ fill: '#DC2626' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <Layout><AnalyticsContent /></Layout>
    </ProtectedRoute>
  );
}
