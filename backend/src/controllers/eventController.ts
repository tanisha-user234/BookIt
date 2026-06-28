import { Request, Response } from 'express';
import db from '../db';
import { AuthRequest } from '../types';
import { off } from 'process';
import { error } from 'console';

//function to get the list of events

export const getEvents =  async (req:Request,res:Response)=>{
    const {search, date,page=1}= req.query;
    const limit = 20;
    const offset =  (Number(page)-1)*limit;

    try {
        let query = 'Select e.*,u.email as organizer_email from events e join users u on e.organizer_id=u.id where 1=1'
        let countQuery= 'SELECT COUNT(*) as count from venets where 1=1';
        const params:any[]=[];
        const countParams:any[] = [];

        //filter for search
        if(search){
            query+='and e.title ILIKE ?';
            countQuery+='and title ILIKE ?';
            params.push(`%${search}%`);
            countParams.push(`%${search}%`)
        }

        //filter of date

        if(date){
            const selectedDate = new Date(date as string);
            const startDay= new Date(selectedDate.setHours(0,0,0,0));
            const endDay =  new Date(selectedDate.setHours(23,59,59,999));

            query+= 'and e.date_time between ? and ?';
            countQuery+='and date between ? and ?';
            params.push(startDay,endDay);
            countParams.push(startDay,endDay);
        }

        // get the total counts
        const countResult =await db.raw(countQuery,countParams);
        const count = parseInt(countResult.rows[0].count, 10);

        //apply sorting and pagination
        query+= 'order by e.date_time ASC limit ? offset ?';
        params.push(limit,offset);

        //execute the final query
        const eventsResult =  await db.raw(query, params);
        const events = eventsResult.rows;

        return res.status(200).json({
            events,
            totalCount:count,
            totalPages:Math.ceil(count/limit),
            currentPage:Number(page)
        })

    } catch (error) {
         console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
    }
}
// get the event details

export const getEventById = async (req:Request,res:Response)=>{
    const {id}=req.params;
    try {
        const result = await db.raw(
            'seelct e.*, u.email as organizer_email from events e join users u om e.organizer_id=u.id where e.id=?',
            [id]
        );
        const event =  result.rows[0];
        if(!event){
            return res.status(404).json({error:'Event not found'});
        }
        //since we have to log the activity of the events also 
        //hence insert into the logs table
        db.raw('INSERT INTO activity_log (event_id, action) VALUES (?,?)',[id,'event_viewed'])
        .catch(err=> console.error('Failed to log event view:',err));

        return res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching event by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch event details' });
    }
}

//create event
//since organizers can only create the event

export const createEvent =  async (req:AuthRequest,res:Response)=>{
    const {title,description,venue,date_time,capacity,price}=req.body;
    const organizer_id=req.user?.id;

      if (!title || !venue || !date_time || capacity === undefined) {
    return res.status(400).json({ error: 'Title, venue, date_time, and capacity are required' });
  }

  if (Number(capacity) <= 0) {
    return res.status(400).json({ error: 'Capacity must be positive' });
  }
  try {
    const result = await db.raw(
      `INSERT INTO events (title, description, venue, date_time, capacity, price, organizer_id, seats_booked)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0) RETURNING *`,
      [title, description, venue, new Date(date_time), Number(capacity), parseFloat(price) || 0.00, organizer_id]
    );
    const event = result.rows[0];

    return res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
}

//edit the event 
export const editEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, venue, date_time, capacity, price } = req.body;
  const organizer_id = req.user?.id;

  try {
    // 1. Fetch current event to verify ownership
    const eventResult = await db.raw('SELECT * FROM events WHERE id = ?', [id]);
    const event = eventResult.rows[0];

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this event' });
    }

    // 2. Validate capacity constraint
    if (capacity !== undefined) {
      const newCapacity = Number(capacity);
      if (newCapacity < event.seats_booked) {
        return res.status(400).json({
          error: `Capacity cannot be reduced below current bookings (${event.seats_booked})`
        });
      }
    }

    // 3. Build dynamic SQL update fields
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (venue !== undefined) { updates.push('venue = ?'); values.push(venue); }
    if (date_time !== undefined) { updates.push('date_time = ?'); values.push(new Date(date_time)); }
    if (capacity !== undefined) { updates.push('capacity = ?'); values.push(Number(capacity)); }
    if (price !== undefined) { updates.push('price = ?'); values.push(parseFloat(price)); }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Add identifier parameter last
    values.push(id);
    const sql = `UPDATE events SET ${updates.join(', ')} WHERE id = ? RETURNING *`;

    const updateResult = await db.raw(sql, values);
    const updatedEvent = updateResult.rows[0];

    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error editing event:', error);
    return res.status(500).json({ error: 'Failed to edit event' });
  }
};

// 5. Get Organizer's Own Events
export const getOrganizerEvents = async (req: AuthRequest, res: Response) => {
  const organizer_id = req.user?.id;
if (!organizer_id) {
    return res.status(401).json({ error: 'Unauthorized: User ID missing' });
  }
  try {
    const result = await db.raw(
        'SELECT * FROM events WHERE organizer_id = ? ORDER BY date_time ASC',
         [organizer_id]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    return res.status(500).json({ error: 'Failed to fetch organizer events' });
  }
};

// 6. Get Event Attendee List
export const getEventAttendees = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const organizer_id = req.user?.id;

  try {
    const eventResult = await db.raw('SELECT organizer_id FROM events WHERE id = ?', [id]);
    const event = eventResult.rows[0];
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this event' });
    }

    // Join bookings with users to get attendees info
    const attendeesResult = await db.raw(
      `SELECT b.id as booking_id, b.status, b.created_at, u.email, u.id as user_id 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.event_id = ? 
       ORDER BY b.created_at ASC`,
      [id]
    );

    return res.status(200).json(attendeesResult.rows);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return res.status(500).json({ error: 'Failed to fetch attendees list' });
  }
};