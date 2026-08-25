'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  KeyRound,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your admin email.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      sessionStorage.setItem('ng_admin_token', data.token);
      router.push('/admin');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid admin credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:grid-cols-2">

          {/* Left panel */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur-sm">
                <Lock className="h-3.5 w-3.5" />
                Admin Portal
              </div>

              <h2 className="text-4xl font-extrabold leading-tight text-white">
                Manage your
                <span className="block text-blue-200">
                  Business Health
                </span>
              </h2>

              <p className="text-sm leading-relaxed text-blue-100/80 max-w-md">
                Securely access submitted Business Health Check
                assessments, scores, business information, and growth
                insights.
              </p>
            </div>

            <div className="relative z-10 mt-10">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <ShieldCheck className="h-5 w-5 text-blue-100" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Secure administrator access
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-100/70">
                      Only authorized NG Stellar administrators should
                      access assessment submissions and customer data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12 bg-slate-900/60">
            <div className="mx-auto w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-7 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h2 className="font-extrabold text-white">
                    NG STELLAR
                  </h2>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                    Consulting Admin
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <Lock className="h-6 w-6 text-blue-400" />
                </div>

                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  Secure Login
                </p>

                <h3 className="text-3xl font-extrabold tracking-tight text-white">
                  Welcome back
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sign in to access the NG Stellar admin dashboard.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-300"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Email Address
                  </label>

                  <div className="relative flex items-center">
                    <Mail className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />

                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ngstellar.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative flex items-center">
                    <KeyRound className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />

                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-12 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="admin-login-btn"
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </span>

                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span>Authorized NG Stellar administrators only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          NG Stellar Consulting · Business Health Check
        </p>
      </div>
    </main>
  );
}