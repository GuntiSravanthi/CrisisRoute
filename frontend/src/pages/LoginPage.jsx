import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showNav={false}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-crisis-red/5 to-crisis-orange/5" />
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-crisis-red to-crisis-orange rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
              <span className="text-2xl font-bold">CrisisRoute</span>
            </Link>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to access disaster assistance tools</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-crisis-red hover:underline">Register</Link>
            </p>

            <div className="mt-6 p-3 rounded-lg bg-slate-800/50 border border-crisis-border text-xs text-slate-500">
              <p className="font-medium text-slate-400 mb-1">Demo Credentials</p>
              <p>User: user@crisisroute.com / user123</p>
              <p>Admin: admin@crisisroute.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
