import { useEffect, useState } from 'react';
import Layout, { ProtectedRoute } from '../components/Layout';
import DisasterMap from '../components/DisasterMap';
import { PageHeader, LoadingSpinner } from '../components/UI';
import { sheltersAPI } from '../services/api';

function SheltersContent() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [center, setCenter] = useState([20.5937, 78.9629]);

  const fetchShelters = (lat, lng) => {
    setLoading(true);

    sheltersAPI
      .list(lat, lng)
      .then((res) => {
        setShelters(res.data);

        if (res.data.length > 0) {
          setCenter([
            res.data[0].latitude,
            res.data[0].longitude,
          ]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          setUserLoc(loc);
          setCenter([loc.lat, loc.lng]);

          fetchShelters(loc.lat, loc.lng);
        },
        () => alert('Unable to get your location')
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="🏠 Shelter Locator"
        subtitle="Find nearby evacuation centers with capacity, contact details and navigation support"
      />

      <div className="flex gap-3 mb-6">
        <button
          onClick={useMyLocation}
          className="btn-primary text-sm"
        >
          📍 Find Nearest Shelters
        </button>

        {userLoc && (
          <span className="text-sm text-green-400 self-center">
            Location Detected ✅
          </span>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* MAP */}
          <div className="lg:col-span-2">
            <DisasterMap
              shelters={shelters}
              center={center}
              zoom={userLoc ? 10 : 5}
              height="550px"
              showReports={false}
            />
          </div>

          {/* SHELTER LIST */}
          <div className="space-y-4 max-h-[550px] overflow-y-auto">

            {shelters.length === 0 && (
              <div className="glass-card p-4 text-center">
                No shelters found
              </div>
            )}

            {shelters.map((shelter, idx) => (
              <div
                key={shelter.id}
                className="glass-card p-4 hover:border-crisis-red transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-green-400">
                      #{idx + 1} Nearest Shelter
                    </span>

                    <h3 className="font-bold text-lg mt-1">
                      {shelter.name}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      📍 {shelter.address}
                    </p>
                  </div>

                  {shelter.distance_km != null && (
                    <div className="text-right">
                      <p className="text-crisis-red font-bold text-lg">
                        {shelter.distance_km} km
                      </p>
                      <p className="text-xs text-slate-500">
                        Away
                      </p>
                    </div>
                  )}
                </div>

                {/* Capacity */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-800/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500">
                      Capacity
                    </p>
                    <p className="font-bold">
                      {shelter.capacity}
                    </p>
                  </div>

                  <div className="bg-slate-800/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500">
                      Available
                    </p>

                    <p className="font-bold text-green-400">
                      {shelter.capacity -
                        shelter.current_occupancy}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-3">
                  <p className="text-sm">
                    📞 {shelter.contact_number}
                  </p>
                </div>

                {/* Facilities */}
                {shelter.facilities && (
                  <div className="mt-3 text-sm text-slate-400">
                    🏥 {shelter.facilities}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">

                  <a
                    href={`tel:${shelter.contact_number}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-lg"
                  >
                    📞 Call
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg"
                  >
                    🗺 Navigate
                  </a>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}

export default function SheltersPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <SheltersContent />
      </Layout>
    </ProtectedRoute>
  );
}