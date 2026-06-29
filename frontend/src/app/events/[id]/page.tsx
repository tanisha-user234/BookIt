"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { Calendar, MapPin, Users, Ticket, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEventDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (err: any) {
      console.error('Error fetching event details:', err);
      setMessage({
        type: 'error',
        text: 'Failed to load event details. It might have been deleted.',
      });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, fetchEventDetails]);

  const handleBookTicket = async () => {
    if (!user) {
      // redirect to login if not logged in
      router.push('/login');
      return;
    }

    setBooking(true);
    setMessage(null);

    try {
      const response = await api.post(`/events/${eventId}/book`);
      setMessage({
        type: 'success',
        text: response.data.message || 'Ticket booked successfully! Enjoy the event.',
      });
      // reload event details
      const updatedEvent = await api.get(`/events/${eventId}`);
      setEvent(updatedEvent.data);
    } catch (err: any) {
      console.error('Booking error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Booking transaction failed. Please try again.',
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-sm">Fetching event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-950 text-center p-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-slate-400 mt-2 max-w-md">
          The event you are looking for does not exist or has been removed.
        </p>
        <Link href="/" className="mt-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    );
  }

  const seatsLeft = event.capacity - event.seats_booked;
  const isSoldOut = seatsLeft <= 0;
  const occupancyRate = (event.seats_booked / event.capacity) * 105;

  const formattedDate = new Date(event.date_time).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const priceNum = Number(event.price);
  const formattedPrice = priceNum === 0 ? 'Free' : `$${priceNum.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        

        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to all events
        </Link>


        {message && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}


        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="inline-block bg-indigo-950 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Live Event
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>
            </div>
            <div className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-2xl px-6 py-3 rounded-2xl shadow-xl transition-all select-none self-stretch sm:self-auto text-center shrink-0">
              {formattedPrice}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-indigo-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date & Time</div>
                <div className="text-sm font-semibold text-slate-200">{formattedDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-indigo-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Venue</div>
                <div className="text-sm font-semibold text-slate-200">{event.venue}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Host Email</div>
                <div className="text-sm font-semibold text-slate-200">{event.organizer_email || 'Organizer'}</div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          

          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                About the Event
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {event.description || 'No detailed description available for this event.'}
              </p>
            </div>
          </div>


          <div className="md:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-indigo-400" /> Ticket Booking
              </h3>


              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Tickets Booked</span>
                  <span className="text-slate-200">{event.seats_booked} / {event.capacity}</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isSoldOut ? 'bg-rose-600' : seatsLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((event.seats_booked / event.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center pt-1">
                  {isSoldOut ? (
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-950/30 px-3 py-1 rounded-full border border-rose-800/40">
                      Sold Out
                    </span>
                  ) : seatsLeft <= 10 ? (
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-950/30 px-3 py-1 rounded-full border border-amber-800/40">
                      Only {seatsLeft} ticket{seatsLeft > 1 ? 's' : ''} left!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-800/40">
                      Tickets Available
                    </span>
                  )}
                </div>
              </div>


              {user?.role === 'organizer' ? (
                <div className="text-center text-xs text-slate-500 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  Organizers cannot book tickets. Please sign in as an attendee to book.
                </div>
              ) : (
                <button
                  onClick={handleBookTicket}
                  disabled={isSoldOut || booking}
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer ${
                    isSoldOut
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed hover:shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/10'
                  }`}
                >
                  {booking ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Confirming Booking...</span>
                    </>
                  ) : isSoldOut ? (
                    <span>Sold Out</span>
                  ) : !user ? (
                    <span>Sign In to Book Ticket</span>
                  ) : (
                    <span>Book Ticket Now</span>
                  )}
                </button>
              )}


              {!user && (
                <p className="text-[10px] text-center text-slate-500 leading-normal">
                  You will be prompted to log in or create an account before your ticket booking can be processed.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
