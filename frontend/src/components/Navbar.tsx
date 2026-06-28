"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, User as UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors">
              <Calendar className="h-6 w-6" />
              <span>BookIt</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Browse Events
            </Link>

            {user?.role === 'organizer' && (
              <Link href="/organizer" className="flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-white transition-colors bg-indigo-950/40 border border-indigo-800/40 px-3 py-1.5 rounded-lg">
                <LayoutDashboard className="h-4 w-4" />
                <span>Organizer Dashboard</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <UserIcon className="h-4 w-4 text-indigo-400" />
                  <span className="max-w-[120px] truncate" title={user.email}>
                    {user.email.split('@')[0]}
                  </span>
                  <span className="text-xs uppercase bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
