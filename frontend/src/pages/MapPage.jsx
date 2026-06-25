import { useEffect, useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import DisasterMap, { severityColors } from '../components/DisasterMap';
import { PageHeader, LoadingSpinner } from '../components/UI';
import { reportsAPI } from '../services/api';

function MapContent() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState([20.5937, 78.9629]);

  useEffect(() => {
    reportsAPI.list()
      .then((res) => {
        setReports(res.data);
        if (res.data.length > 0) {
          setCenter([res.data[0].latitude, res.data[0].longitude]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Hazard Map" subtitle="Real-time disaster reports with severity-coded markers on OpenStreetMap" />

      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(severityColors).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-slate-400">{level} Risk</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DisasterMap
            reports={reports}
            center={center}
            zoom={5}
            height="550px"
            onReportClick={(r) => {
              setSelected(r);
              setCenter([r.latitude, r.longitude]);
            }}
          />
        </div>

        <div className="glass-card p-4 max-h-[550px] overflow-y-auto">
          <h3 className="font-semibold mb-4">Active Reports ({reports.length})</h3>
          <div className="space-y-3">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => {
                  setSelected(report);
                  setCenter([report.latitude, report.longitude]);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selected?.id === report.id
                    ? 'border-crisis-red bg-crisis-red/10'
                    : 'border-crisis-border hover:border-slate-500'
                }`}
              >
                <p className="font-medium text-sm">{report.title}</p>
                <p className="text-xs text-slate-400 mt-1">{report.location_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: severityColors[report.severity] || severityColors.Low }}
                  />
                  <span className="text-xs text-slate-500">{report.disaster_type} • {report.severity}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <ProtectedRoute>
      <Layout><MapContent /></Layout>
    </ProtectedRoute>
  );
}
