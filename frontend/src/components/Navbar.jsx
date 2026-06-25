import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', auth: true },
  { path: '/report', label: 'Report', auth: true },
  { path: '/detect', label: 'AI Detect', auth: true },
  { path: '/map', label: 'Hazard Map', auth: true },
  { path: '/shelters', label: 'Shelters', auth: true },
  { path: '/assistant', label: 'Assistant', auth: true },
  { path: '/analytics', label: 'Analytics', auth: true },
  { path: '/reports', label: 'Reports', auth: true },
  { path: '/admin', label: 'Admin', auth: true, admin: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-crisis-dark/90 backdrop-blur-lg border-b border-crisis-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-crisis-red to-crisis-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              CrisisRoute
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user ? (
              navLinks
                .filter((link) => !link.admin || user.is_admin)
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-crisis-red/20 text-crisis-red'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-400">
                {user.full_name}
              </span>
              <button onClick={logout} className="btn-secondary text-sm py-2 px-4">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
