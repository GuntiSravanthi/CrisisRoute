import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showNav={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
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
            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
            <p className="text-slate-400 text-sm mb-6">Join the disaster response community</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-crisis-red hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
