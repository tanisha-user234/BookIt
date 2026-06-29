"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../context/AuthContext';
import api from '../../../../../lib/api';
import { ArrowLeft, Loader2, BarChart3, Users, Eye, TrendingUp, DollarSign, Calendar, ShieldAlert } from 'lucide-react';

export default function EventAnalytics() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const eventId = params.id;

  const [analytics, setAnalytics] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // route protection check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'organizer')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchAnalyticsAndAttendees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // load in parallel
      const [analyticsRes, attendeesRes] = await Promise.all([
        api.get(`/organizer/events/${eventId}/analytics`),
        api.get(`/organizer/events/${eventId}/attendees`),
      ]);

      setAnalytics(analyticsRes.data);
      setAttendees(attendeesRes.data || []);
    } catch (err: any) {
      console.error('Error fetching analytics/attendees:', err);
      setError(
        err.response?.data?.error || 
        'Failed to fetch event analytics. Make sure you own this event.'
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (user && user.role === 'organizer' && eventId) {
      fetchAnalyticsAndAttendees();
    }
  }, [user, eventId, fetchAnalyticsAndAttendees]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-sm">Generating analytics report...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950 text-center p-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 mt-2 max-w-md">
          {error || 'You do not have permission to view analytics for this event.'}
        </p>
        <Link href="/organizer" className="mt-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { metrics } = analytics;

  const priceVal = Number(analytics.price || 0);
  const revenue = priceVal * (metrics.confirmed || 0);

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        

        <Link href="/organizer" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>


        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Event Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            Performance metrics and attendee list for <strong className="text-indigo-400">{analytics.title}</strong>
          </p>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-slate-950 rounded-lg text-indigo-400 border border-slate-800">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Page Views</div>
              <div className="text-2xl font-bold text-white mt-0.5">{metrics.views || 0}</div>
            </div>
          </div>


          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-slate-950 rounded-lg text-emerald-400 border border-slate-800">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tickets Confirmed</div>
              <div className="text-2xl font-bold text-white mt-0.5">{metrics.confirmed || 0}</div>
            </div>
          </div>


          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-slate-950 rounded-lg text-purple-400 border border-slate-800">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Rate</div>
              <div className="text-2xl font-bold text-white mt-0.5">{metrics.conversionRate || 0}%</div>
            </div>
          </div>


          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-slate-950 rounded-lg text-amber-400 border border-slate-800">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</div>
              <div className="text-2xl font-bold text-white mt-0.5">${revenue.toFixed(2)}</div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          

          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" /> Booking Funnel
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>1. Event Views</span>
                  <span className="text-white font-semibold">{metrics.views || 0}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>2. Booking Started</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-semibold">{metrics.starts || 0}</span>
                    <span className="text-[10px] text-slate-500">
                      ({metrics.views > 0 ? Math.round((metrics.starts / metrics.views) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div
                    className="bg-indigo-400 h-full rounded-full"
                    style={{ width: `${metrics.views > 0 ? (metrics.starts / metrics.views) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>3. Booking Confirmed</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-semibold">{metrics.confirmed || 0}</span>
                    <span className="text-[10px] text-slate-500">
                      ({metrics.views > 0 ? Math.round((metrics.confirmed / metrics.views) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${metrics.views > 0 ? (metrics.confirmed / metrics.views) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>4. Booking Cancelled</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400 font-semibold">{metrics.cancelled || 0}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${metrics.confirmed > 0 ? (metrics.cancelled / metrics.confirmed) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>


          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Attendee List ({attendees.length})</h2>
            </div>

            <div className="overflow-x-auto flex-grow">
              {attendees.length > 0 ? (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Attendee Email</th>
                      <th className="px-6 py-4">Date Booked</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {attendees.map((attendee) => {
                      const dateStr = new Date(attendee.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const isCancelled = attendee.status === 'CANCELLED';

                      return (
                        <tr key={attendee.booking_id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-200">
                            {attendee.email}
                          </td>
                          <td className="px-6 py-4 flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{dateStr}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isCancelled 
                                ? 'bg-rose-950/30 border border-rose-900/50 text-rose-400' 
                                : 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-400'
                            }`}>
                              {attendee.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 text-slate-500 text-sm space-y-1">
                  <p>No ticket bookings yet.</p>
                  <p className="text-xs text-slate-655">Once attendees book seats, their details will appear here.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
