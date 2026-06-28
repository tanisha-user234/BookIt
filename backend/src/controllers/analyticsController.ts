import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../types';
import { error } from 'console';

export const getEventAnalytics = async (req:AuthRequest,res:Response)=>{
    const eventId= Number(req.params.id);
    const organizerId= req.user?.id;
    try {
        const eventResult =  await db.raw('SELECT * from events where id=?',[eventId]);
        const event = eventResult.rows[0];
        if(!event){
            return res.status(404).json({error:'Event not found'});

        }
        if(event.organizer_id !== organizerId){
            return res.status(403).json({error:"Forbidden: You do not own this event"});
        }
        const logsResult =  await db.raw(
            'select action, COUNT(id) as count from activity_log where event_id =? group by action',
            [eventId]
        );
        const logs =logsResult.rows;
let views = 0;
    let starts = 0;
    let confirmed = 0;
    let cancelled = 0;

    logs.forEach((log: any) => {
      const count = Number(log.count);
      if (log.action === 'event_viewed') views = count;
      else if (log.action === 'booking_started') starts = count;
      else if (log.action === 'booking_confirmed') confirmed = count;
      else if (log.action === 'booking_cancelled') cancelled = count;
    });

    // Compute conversion rate
    const conversionRate = views > 0 ? parseFloat(((confirmed / views) * 100).toFixed(2)) : 0.00;

    return res.status(200).json({
      eventId,
      title: event.title,
      capacity: event.capacity,
      seats_booked: event.seats_booked,
      price: event.price,
      metrics: {
        views,
        starts,
        confirmed,
        cancelled,
        conversionRate
      }
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch event analytics' });
  }
}