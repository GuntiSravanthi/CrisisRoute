import { useEffect, useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import { PageHeader, LoadingSpinner, SeverityBadge, DisasterIcon } from '../components/UI';
import { reportsAPI } from '../services/api';

function ReportsContent() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.myReports()
      .then((res) => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (id) => {
    try {
      const res = await reportsAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `crisisroute_report_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="My Reports" subtitle="View and download PDF reports of your disaster submissions" />

      {reports.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <p className="text-4xl mb-4">📄</p>
          <p>No reports submitted yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="glass-card p-5 hover:border-crisis-red/30 transition-all">
              <div className="flex items-start justify-between">
                <DisasterIcon type={report.disaster_type} />
                <SeverityBadge severity={report.severity} />
              </div>
              <h3 className="font-semibold mt-3">{report.title}</h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{report.description}</p>
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <p>📍 {report.location_name}</p>
                <p>🤖 {report.disaster_type || 'Unclassified'} ({report.confidence ? `${(report.confidence * 100).toFixed(0)}%` : 'N/A'})</p>
                <p>📅 {new Date(report.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => downloadPDF(report.id)}
                className="btn-secondary w-full mt-4 text-sm py-2"
              >
                📥 Download PDF Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <Layout><ReportsContent /></Layout>
    </ProtectedRoute>
  );
}
