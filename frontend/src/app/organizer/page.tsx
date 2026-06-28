"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Calendar, MapPin, Plus, Loader2, ArrowRight, BarChart3, Users, DollarSign, X } from 'lucide-react';

export default function OrganizerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  // 1. Role-based Route Protection
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'organizer')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchOrganizerEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/organizer/events');
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error fetching organizer events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'organizer') {
      fetchOrganizerEvents();
    }
  }, [user, fetchOrganizerEvents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue || !dateTime || !capacity) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormError('');
    setCreating(true);

    try {
      await api.post('/organizer/events', {
        title,
        description,
        venue,
        date_time: dateTime,
        capacity: Number(capacity),
        price: parseFloat(price) || 0.00,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setVenue('');
      setDateTime('');
      setCapacity('');
      setPrice('');
      setShowCreateModal(false);
      
      // Re-fetch events
      fetchOrganizerEvents();
    } catch (err: any) {
      console.error('Create event error:', err);
      setFormError(err.response?.data?.error || 'Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || (!user || user.role !== 'organizer')) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Organizer Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create events, track ticket sales, and view metrics.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
            <p className="text-slate-400 mt-2 text-sm">Loading your events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => {
              const formattedDate = new Date(event.date_time).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const priceVal = Number(event.price);
              const formattedPrice = priceVal === 0 ? 'Free' : `$${priceVal.toFixed(2)}`;
              const occupancy = Math.round((event.seats_booked / event.capacity) * 100);

              return (
                <div
                  key={event.id}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 shadow-xl hover:border-slate-700 transition-all duration-200"
                >
                  <div className="space-y-3 flex-grow max-w-xl">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white line-clamp-1">{event.title}</h3>
                      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-850 text-indigo-400">
                        {formattedPrice}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    {/* Compact capacity indicator */}
                    <div className="space-y-1.5 max-w-xs">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                        <span>Booked: {event.seats_booked} / {event.capacity} seats</span>
                        <span>{occupancy}%</span>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-850 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${Math.min(occupancy, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-4 shrink-0 justify-end">
                    <Link
                      href={`/events/${event.id}`}
                      className="text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950 py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <span>Preview Page</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href={`/organizer/events/${event.id}/analytics`}
                      className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/5 transition-all"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Analytics</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-905 border border-slate-850 rounded-2xl">
            <Plus className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No Events Hosted Yet</h3>
            <p className="text-slate-400 mt-1 max-w-xs mx-auto text-sm">
              Click the button above to host your first live event and start accepting ticket bookings.
            </p>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Create New Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-rose-950/20 border border-rose-800/40 text-rose-300 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Event Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rock Concert 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Event Description
                    </label>
                    <textarea
                      placeholder="Tell attendees about the event schedules, lineup, rules, etc."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-855 rounded-xl py-3 px-4 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Venue */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Venue / Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Central Arena, London"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors scheme-dark"
                    />
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Ticket Capacity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 500"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Ticket Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="e.g. 49.99 (Leave blank for Free)"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                </div>

                {/* Modal Actions */}
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="py-2.5 px-5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-850/50 text-slate-300 font-semibold transition-colors cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer text-sm"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Host Event</span>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
