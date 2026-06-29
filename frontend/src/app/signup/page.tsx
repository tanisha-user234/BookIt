"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { KeyRound, Mail, AlertCircle, Loader2, User as UserIcon, Building } from 'lucide-react';

export default function Signup() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');
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
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/signup', { email, password, role });
      login(response.data.user);
      
      // redirect depending on role
      if (response.data.user.role === 'organizer') {
        router.push('/organizer');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.error || 
        'Registration failed. Please check your inputs and try again.'
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
            Create an Account
          </h2>
          <p className="text-sm text-slate-400">
            Join BookIt to start attending or organizing live events
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
            

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Register as a
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    role === 'user'
                      ? 'border-indigo-500 bg-indigo-950/20 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserIcon className={`h-6 w-6 ${role === 'user' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div className="font-semibold text-sm">Attendee</div>
                  <div className="text-[10px] text-slate-500">I want to book tickets</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    role === 'organizer'
                      ? 'border-indigo-500 bg-indigo-950/20 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building className={`h-6 w-6 ${role === 'organizer' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div className="font-semibold text-sm">Organizer</div>
                  <div className="text-[10px] text-slate-500">I want to host events</div>
                </button>
              </div>
            </div>


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
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="•••••••• (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>


            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Registering...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-400 border-t border-slate-850 pt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
