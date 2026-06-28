import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../types';
import { error } from 'console';

//seat bookinf
export const bookEvent = async (req:AuthRequest,res:Response)=>{
    const eventId = Number(req.params.id);
    const userId = req.user?.id;

    if(!userId){
        return res.status(401).json({error:'Unauthorized'});
    }

    try {
        //first insert the action in the log table
        db.raw('INSERT into activity_log(event_id,action) VALUES (?,?)',[eventId,'booking_started'])
        .catch(err=>console.error('Failed to log booking start',err));

        //start an isolated transaction
        db.transaction(async(trx)=>{
            //first lock the row in which we are booking
            const eventResult= await trx.raw(
                'SELECT capacity,seats_booked from events where id=? for update',
                [eventId]
            );
            const event=eventResult.rows[0];
            if(!event){
                const error:any=new Error('Event not found');
                error.status =404;
                throw error;
            }
            //checking capacity
            if(event.seats_booked >= event.capacity){
        const error: any = new Error('Event is sold out');
        error.status = 409; 
        throw error            }
                //prevent double boking
        const bookingResult = await trx.raw(
            "SELECT id FROM bookings where user_id=? and event_id=? and status='CONFIRMED'",
            [userId,eventId]
        )
         if (bookingResult.rows.length > 0) {
        const error: any = new Error('You have already booked a seat for this event');
        error.status = 400;
        throw error;
      }
       //book the seat
      await trx.raw(
        "INSERT INTO bookings (user_id, event_id, status) VALUES (?, ?, 'CONFIRMED')",
        [userId, eventId]
      );

     //update the number of seats_booked
      await trx.raw(
        'UPDATE events SET seats_booked = seats_booked + 1 WHERE id = ?',
        [eventId]
      );

      //mark that event booked in the log table
      await trx.raw(
        "INSERT INTO activity_log (event_id, action) VALUES (?, 'booking_confirmed')",
        [eventId]
      );
    });

    return res.status(201).json({ message: 'Booking confirmed successfully!' });
    
        

    } catch (error:any) {
     console.error('Booking failed:', error.message);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Booking transaction failed' });
  }   
    };
    export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const bookingId = Number(req.params.id);
  const userId = req.user?.id;

  try {
    await db.transaction(async (trx) => {
      // Find the booking and lock it
      const bookingResult = await trx.raw(
        'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
        [bookingId]
      );
      const booking = bookingResult.rows[0];

      if (!booking) {
        const error: any = new Error('Booking not found');
        error.status = 404;
        throw error;
      }

      if (booking.user_id !== userId) {
        const error: any = new Error('Forbidden: You do not own this booking');
        error.status = 403;
        throw error;
      }

      if (booking.status === 'CANCELLED') {
        const error: any = new Error('Booking is already cancelled');
        error.status = 400;
        throw error;
      }

      // Update booking status
      await trx.raw(
        "UPDATE bookings SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [bookingId]
      );

      // Decrement booked seats
      await trx.raw(
        'UPDATE events SET seats_booked = seats_booked - 1 WHERE id = ?',
        [booking.event_id]
      );

      // Log cancellation
      await trx.raw(
        "INSERT INTO activity_log (event_id, action) VALUES (?, 'booking_cancelled')",
        [booking.event_id]
      );
    });

    return res.status(200).json({ message: 'Booking cancelled successfully, seat freed.' });
  } catch (error: any) {
    console.error('Cancellation failed:', error.message);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || 'Cancellation failed' });
  }
};

