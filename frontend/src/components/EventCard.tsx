import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react';

export interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  date_time: string;
  capacity: number;
  price: string | number;
  seats_booked: number;
  organizer_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const seatsLeft = event.capacity - event.seats_booked;
  const isSoldOut = seatsLeft <= 0;
  const occupancyRate = (event.seats_booked / event.capacity) * 100;

  // Format date
  const formattedDate = new Date(event.date_time).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format price
  const priceNum = Number(event.price);
  const formattedPrice = priceNum === 0 ? 'Free' : `$${priceNum.toFixed(2)}`;

  // Determine progress bar color
  let progressColor = 'bg-emerald-500';
  if (isSoldOut) progressColor = 'bg-rose-600';
  else if (occupancyRate >= 80) progressColor = 'bg-amber-500';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col h-full group">
      {/* Card Header & Price Tag */}
      <div className="relative p-6 pb-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <span className="shrink-0 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-semibold px-2.5 py-1 rounded-lg text-sm flex items-center">
            {formattedPrice}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-400 line-clamp-2 min-h-[40px]">
          {event.description || 'No description provided.'}
        </p>
      </div>

      {/* Card Body - Details */}
      <div className="px-6 py-3 border-t border-b border-slate-800/60 bg-slate-950/20 flex-grow space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="line-clamp-1">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Users className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>
            {event.seats_booked} / {event.capacity} seats booked
          </span>
        </div>
      </div>

      {/* Progress & Call to Action */}
      <div className="p-6 pt-4 space-y-4">
        {/* Seats Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className={isSoldOut ? 'text-rose-400' : 'text-slate-400'}>
              {isSoldOut ? 'Sold Out' : `${seatsLeft} seats left`}
            </span>
            <span className="text-slate-400">{Math.round(occupancyRate)}% full</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`${progressColor} h-full transition-all duration-500`}
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* View Details Link */}
        <Link
          href={`/events/${event.id}`}
          className={`block text-center w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 shadow-md ${
            isSoldOut
              ? 'bg-slate-800 text-slate-400 hover:bg-slate-700/80'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-600/10'
          }`}
        >
          {isSoldOut ? 'View Details' : 'Book Ticket'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
