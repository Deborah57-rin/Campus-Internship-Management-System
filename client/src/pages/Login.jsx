import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, GraduationCap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      const resolvedRole = res?.data?.role;
      if (resolvedRole === 'admin') navigate('/admin/dashboard');
      else if (resolvedRole === 'lecturer') navigate('/lecturer/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Ensure backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative isolate">
        {/* Subtle academic background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(11,31,58,0.12),transparent_55%),radial-gradient(900px_circle_at_80%_0%,rgba(193,18,31,0.10),transparent_50%)]"
        />

        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="p-6 sm:p-10">
              <div className="mx-auto w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-usiu-navy/10 text-usiu-navy ring-1 ring-usiu-navy/15">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Internship Portal</p>
                      <p className="text-xs text-slate-500">Sign in with your institutional account</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-usiu-red">USIU-Africa</p>
                    <p className="text-[11px] text-slate-500">Internship Monitoring</p>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4" />
                      <p className="leading-5">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-usiu-navy focus:ring-4 focus:ring-usiu-navy/15"
                        placeholder="student@usiu.ac.ke"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-usiu-navy focus:ring-4 focus:ring-usiu-navy/15"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-usiu-red px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-usiu-red/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-200">
                  <p className="font-medium text-slate-700">Having trouble?</p>
                  <p className="mt-1">
                    Confirm your email and password. If you still can’t sign in, contact the
                    Internship Office for account support.
                  </p>
                </div>

                <p className="mt-6 text-center text-[11px] text-slate-500">
                  Protected system. Authorized personnel only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;