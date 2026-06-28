"use client";

import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import EventCard, { Event } from '../components/EventCard';
import { Search, Calendar, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounced/fetch function
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/events', {
        params: {
          search: search || undefined,
          date: date || undefined,
          page,
        },
      });
      setEvents(response.data.events || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError('Could not load events. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [search, date, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle filter resets
  const handleResetFilters = () => {
    setSearch('');
    setDate('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero / Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Experience Live Events Like Never Before
          </h1>
          <p className="text-lg text-slate-400">
            Book tickets to the best concerts, professional summits, and comedy nights happening in your area.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by event title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-1 md:w-48">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors scheme-dark"
              />
            </div>

            {(search || date) && (
              <button
                onClick={handleResetFilters}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 p-4 rounded-xl flex items-center justify-between">
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchEvents}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-950/50 px-3 py-1.5 rounded-lg border border-rose-800/50 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900 border border-slate-800 rounded-xl h-[420px] animate-pulse flex flex-col p-6 space-y-6">
                <div className="flex justify-between">
                  <div className="h-7 w-2/3 bg-slate-800 rounded"></div>
                  <div className="h-7 w-12 bg-slate-800 rounded"></div>
                </div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 w-full bg-slate-800 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-slate-800 rounded-full"></div>
                  <div className="h-10 w-full bg-slate-800 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-slate-900/40 border border-slate-850 rounded-2xl">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No Events Found</h3>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">
              There are no events matching your criteria right now. Check back later or adjust your filters.
            </p>
            {(search || date) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-900">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
