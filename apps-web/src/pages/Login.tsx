import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles } from 'lucide-react';

import api from '../services/api';

interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const data = response.data?.data;

      const accessToken = data?.accessToken;
      const user = data?.user as LoginUser | undefined;

      if (!accessToken || !user) {
        throw new Error('Invalid login response from server.');
      }

      // Save authentication details
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // ==========================================
      // ROLE-BASED REDIRECT
      // ==========================================

      if (user.role === 'SALON_OWNER') {
        navigate('/dashboard', { replace: true });
        return;
      }

      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
        return;
      }

      // CUSTOMER and any normal user
      navigate('/customer', { replace: true });

    } catch (err: any) {
      console.error('Login error:', err);

      const message = err?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(', '));
      } else if (message) {
        setError(message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">

      <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

          {/* =====================================
              LEFT SIDE
          ====================================== */}

          <div className="hidden bg-slate-900 p-12 text-white lg:block">

            <div className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                <Sparkles size={20} />
              </div>

              <span className="text-2xl font-bold">
                GlowBook
              </span>

            </div>

            <div className="mt-24">

              <h1 className="text-5xl font-bold leading-tight">

                Welcome back.

                <span className="block text-slate-400">
                  Your next appointment awaits.
                </span>

              </h1>

              <p className="mt-6 max-w-md leading-7 text-slate-400">
                Sign in to discover salons, explore services,
                choose your stylist and book your next appointment.
              </p>

            </div>

          </div>

          {/* =====================================
              RIGHT SIDE
          ====================================== */}

          <div className="p-8 sm:p-12">

            <div className="mx-auto max-w-md">

              {/* MOBILE LOGO */}

              <div className="mb-8 lg:hidden">

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Sparkles size={20} />
                  </div>

                  <span className="text-2xl font-bold">
                    GlowBook
                  </span>

                </div>

              </div>

              <h2 className="text-3xl font-bold">
                Sign in
              </h2>

              <p className="mt-2 text-slate-500">
                Access your GlowBook account.
              </p>

              {/* ERROR */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                  {error}

                </div>
              )}

              {/* LOGIN FORM */}

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Email
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-slate-500">

                    <Mail
                      size={19}
                      className="text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full outline-none"
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Password
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-slate-500">

                    <Lock
                      size={19}
                      className="text-slate-400"
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full outline-none"
                      required
                    />

                  </div>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-950 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? 'Signing in...'
                    : 'Sign in'}

                </button>

              </form>

              {/* REGISTER */}

              <p className="mt-8 text-center text-sm text-slate-500">

                Don't have an account?{' '}

                <Link
                  to="/register"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Create account
                </Link>

              </p>

              {/* HOME */}

              <Link
                to="/"
                className="mt-5 block text-center text-sm text-slate-400 hover:text-slate-700"
              >
                ← Back to home
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;