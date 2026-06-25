import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crisis-dark">
        <div className="animate-spin w-10 h-10 border-4 border-crisis-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
}

export default function Layout({ children, showNav = true }) {
  return (
    <div className="min-h-screen bg-crisis-dark">
      {showNav && <Navbar />}
      <main className={showNav ? 'pt-16' : ''}>{children}</main>
    </div>
  );
}
