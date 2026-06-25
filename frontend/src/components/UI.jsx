const severityColors = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const typeIcons = {
  Flood: '🌊',
  Fire: '🔥',
  Landslide: '⛰️',
  'Cyclone Damage': '🌀',
  'Earthquake Damage': '🏚️',
};

export function SeverityBadge({ severity }) {
  const cls = severityColors[severity] || severityColors.Low;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {severity || 'Unknown'}
    </span>
  );
}

export function DisasterIcon({ type }) {
  return <span className="text-2xl">{typeIcons[type] || '⚠️'}</span>;
}

export function StatCard({ title, value, subtitle, icon, color = 'red' }) {
  const colorMap = {
    red: 'from-red-500/20 to-red-600/5 border-red-500/20',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-3xl opacity-80">{icon}</span>}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-10 h-10 border-4 border-crisis-red border-t-transparent rounded-full" />
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );
}
