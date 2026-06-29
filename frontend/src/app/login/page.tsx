"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        router.push('/organizer');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user);
      
      // redirect depending on role
      if (response.data.user.role === 'organizer') {
        router.push('/organizer');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to book tickets and manage your events
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 p-3.5 rounded-lg flex items-start gap-2.5 text-sm">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>


            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 hover:shadow-lg hover:shadow-indigo-600/10 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-400 border-t border-slate-850 pt-6">
          New to BookIt?{' '}
          <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
