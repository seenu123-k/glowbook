import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';

import api from '../services/api';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // IMPORTANT:
      // Do not send role from frontend.
      // New registrations should become CUSTOMER.
      const body = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      };

      const response = await api.post(
        '/auth/register',
        body,
      );

      console.log(
        'Registration response:',
        response.data,
      );

      setSuccess(
        'Registration successful. Redirecting to login...',
      );

      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
      });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
        });
      }, 1000);
    } catch (err: any) {
      console.error(
        'Registration error:',
        err,
      );

      const message =
        err?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(', '));
      } else if (message) {
        setError(message);
      } else {
        setError(
          'Registration failed. Please try again.',
        );
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
              LEFT
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

                Your beauty journey

                <span className="block text-slate-400">
                  starts here.
                </span>

              </h1>

              <p className="mt-6 max-w-md leading-7 text-slate-400">
                Create your account and discover salons,
                services and convenient appointment slots.
              </p>

            </div>

          </div>

          {/* =====================================
              RIGHT
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
                Create account
              </h2>

              <p className="mt-2 text-slate-500">
                Join GlowBook today.
              </p>

              {/* ERROR */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleRegister}
                className="mt-8 space-y-5"
              >

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Full name
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-slate-500">

                    <User
                      size={19}
                      className="text-slate-400"
                    />

                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        updateField(
                          'name',
                          e.target.value,
                        )
                      }
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full outline-none"
                      required
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Email
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-slate-500">

                    <Mail
                      size={19}
                      className="text-slate-400"
                    />

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField(
                          'email',
                          e.target.value,
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full outline-none"
                      required
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Phone
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-slate-500">

                    <Phone
                      size={19}
                      className="text-slate-400"
                    />

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        updateField(
                          'phone',
                          e.target.value,
                        )
                      }
                      placeholder="9876500000"
                      autoComplete="tel"
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

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-slate-500">

                    <Lock
                      size={19}
                      className="text-slate-400"
                    />

                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        updateField(
                          'password',
                          e.target.value,
                        )
                      }
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      className="w-full outline-none"
                      required
                    />

                  </div>

                </div>

                {/* REGISTER BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-950 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? 'Creating account...'
                    : 'Create account'}
                </button>

              </form>

              {/* LOGIN */}

              <p className="mt-8 text-center text-sm text-slate-500">

                Already have an account?{' '}

                <Link
                  to="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
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

export default Register;