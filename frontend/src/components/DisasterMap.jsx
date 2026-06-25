import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const severityColors = {
  High: '#DC2626',
  Medium: '#EA580C',
  Low: '#EAB308',
};

function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const shelterIcon = L.divIcon({
  className: 'shelter-marker',
  html: `<div style="background:#22C55E;width:16px;height:16px;border-radius:4px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:10px">🏠</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function DisasterMap({
  reports = [],
  shelters = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '500px',
  showReports = true,
  showShelters = true,
  onReportClick,
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-crisis-border" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} />

        {showReports && reports.map((report) => (
          <CircleMarker
            key={`report-${report.id}`}
            center={[report.latitude, report.longitude]}
            radius={10}
            pathOptions={{
              color: severityColors[report.severity] || severityColors.Low,
              fillColor: severityColors[report.severity] || severityColors.Low,
              fillOpacity: 0.8,
              weight: 2,
            }}
            eventHandlers={{ click: () => onReportClick?.(report) }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <p className="font-bold text-gray-900">{report.title}</p>
                <p className="text-gray-600">{report.disaster_type || 'Unclassified'}</p>
                <p className="text-gray-500 text-xs">{report.location_name}</p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded text-xs text-white"
                  style={{ background: severityColors[report.severity] || '#EAB308' }}
                >
                  {report.severity} Risk
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showShelters && shelters.map((shelter) => (
          <Marker
            key={`shelter-${shelter.id}`}
            position={[shelter.latitude, shelter.longitude]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <p className="font-bold text-gray-900">{shelter.name}</p>
                <p className="text-gray-600">Capacity: {shelter.capacity}</p>
                <p className="text-gray-600">Available: {shelter.capacity - shelter.current_occupancy}</p>
                <p className="text-gray-500">{shelter.contact_number}</p>
                {shelter.distance_km != null && (
                  <p className="text-green-600 font-medium">{shelter.distance_km} km away</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export { severityColors, createIcon };
