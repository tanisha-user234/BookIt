import db from '../db';

// periodically scans for the expired PENDING seats and releases seats back to capacity 
export const cleanupExpiredHolds = async ()=>{
    try {
        //fetch those pending bookings
        const expiredBookingResults = await db.raw(
            `SELECT id,event_id FROM bookings WHERE status ='PENDING' AND expires_at<CURRENT_TIMESTAMP`
        );

        const expiredBookings = expiredBookingResults.rows;
        if(expiredBookings.length === 0){
            return
        }

        console.log(`[JOB] Found ${expiredBookings.length} expired seats hold. Releasing seats...`);
        for(const booking of expiredBookings){
            await db.transaction(async (trx)=>{
                //MARK THE BOOKING AS EXPIRED
                await trx.raw(
                    "UPDATE bookings SET status='EXPIRED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='PENDING'",
                    [booking.id]
                );
                //now decrement the seats booked
                await trx.raw(
                    'UPDATE events SET seats_booked = GREATEST(0,seats_booked-1),updated_at=CURRENT_TIMESTAMP WHERE id=?',
                    [booking.event_id]
                )

                //log that expired event
                await trx.raw(
                    "INSERT INTO activity_log (event_id,action) VALUES (?,'hold_expired')",
                    [booking.event_id]
                )
            })
            console.log(`[JOB] Sucessfully released ${expiredBookings.length} seats`)
        }
    } catch (error) {
        console.error('[JOB ERROR] Failed to clean up expired');
    }
};

// start this cleanup every thirty second
export const startHoldCleanUpJob =(intervalMs=30000)=>{
    console.log(`[JOB] Starting seat hold cleanup worker (Interval :${intervalMs/1000}s) `);
    setInterval(cleanupExpiredHolds,intervalMs);
}