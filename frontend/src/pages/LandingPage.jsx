import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-4">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 blur-3xl rounded-full"></div>

      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main Card */}
      <div className="relative z-10 max-w-3xl w-full">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 md:p-14 shadow-2xl text-center">

          {/* Emergency Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-5xl shadow-lg">
            🚨
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">
            CrisisRoute
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-lg md:text-xl mb-3">
            AI-Powered Disaster Assistance Platform
          </p>

          <p className="text-slate-400 max-w-xl mx-auto mb-10">
            Helping communities respond to floods, fires, earthquakes,
            cyclones, and landslides through AI-powered reporting,
            hazard mapping, and emergency guidance.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl text-white font-semibold text-lg transition-all duration-300 shadow-lg"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 border border-orange-500 text-orange-400 rounded-xl hover:bg-orange-500 hover:text-white font-semibold text-lg transition-all duration-300"
            >
              Create Account
            </button>

          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-3xl mb-2">🌊</div>
              <h3 className="text-white font-semibold">
                Disaster Reporting
              </h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-3xl mb-2">🗺️</div>
              <h3 className="text-white font-semibold">
                Hazard Mapping
              </h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-white font-semibold">
                AI Emergency Support
              </h3>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}