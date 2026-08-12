import db from '../db';
import jwt from 'jsonwebtoken';

const API_BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

/**
 * Concurrency Test Script
 * Simulates 50 simultaneous booking requests against an event with ONLY 5 SEATS.
 */
async function runConcurrencyTest() {
  console.log('🧪 Starting Concurrency Stress Test...');

  try {
    // 1. Clean up & Create Test Organizer
    await db.raw("DELETE FROM users WHERE email LIKE 'stress_%@test.com'");
    await db.raw("DELETE FROM events WHERE title = 'Stress Test Concert'");

    const orgRes = await db.raw(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ('stress_org@test.com', 'hashed_pass', 'organizer') RETURNING id`
    );
    const organizerId = orgRes.rows[0].id;

    // 2. Create Test Event with capacity = 5
    const eventRes = await db.raw(
      `INSERT INTO events (title, description, venue, date_time, capacity, seats_booked, organizer_id) 
       VALUES ('Stress Test Concert', 'Testing oversell protection', 'Virtual Arena', NOW() + INTERVAL '1 day', 5, 0, ?) RETURNING id`,
      [organizerId]
    );
    const eventId = eventRes.rows[0].id;
    console.log(`✅ Created test event ID ${eventId} with capacity = 5.`);

    // 3. Create 50 unique test users & generate valid JWT auth tokens
    const TOTAL_REQUESTS = 50;
    const tokens: string[] = [];

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
      const userRes = await db.raw(
        `INSERT INTO users (email, password_hash, role) 
         VALUES (?, 'hash', 'user') RETURNING id, email`,
        [`stress_user_${i}_${Date.now()}@test.com`]
      );
      const user = userRes.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
      tokens.push(token);
    }
    console.log(`✅ Created ${TOTAL_REQUESTS} distinct user tokens.`);

    // 4. Fire 50 SIMULTANEOUS booking requests using Promise.all()
    console.log(`⚡ Firing ${TOTAL_REQUESTS} parallel booking HTTP requests...`);
    const startTime = Date.now();

    const requestPromises = tokens.map((token) =>
      fetch(`${API_BASE_URL}/events/${eventId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }).then(async (res) => ({
        status: res.status,
        body: await res.json()
      }))
    );

    const results = await Promise.all(requestPromises);
    const duration = Date.now() - startTime;

    // 5. Analyze Results
    const successes = results.filter((r) => r.status === 201);
    const soldOuts = results.filter((r) => r.status === 409);
    const others = results.filter((r) => r.status !== 201 && r.status !== 409);

    console.log(`\n================ TEST RESULTS ================`);
    console.log(`⏱️ Total Time Elapsed: ${duration} ms`);
    console.log(`✅ Successful Reservations (201 Created): ${successes.length}`);
    console.log(`❌ Sold Out Responses (409 Conflict): ${soldOuts.length}`);
    console.log(`⚠️ Other Errors: ${others.length}`);

    // 6. Verify Database Final State
    const finalEventRes = await db.raw('SELECT capacity, seats_booked FROM events WHERE id = ?', [eventId]);
    const finalEvent = finalEventRes.rows[0];
    console.log(`📊 DB Final State -> capacity: ${finalEvent.capacity}, seats_booked: ${finalEvent.seats_booked}`);

    // Assertions
    if (successes.length === 5 && finalEvent.seats_booked === 5 && soldOuts.length === 45) {
      console.log(`🎉 SUCCESS! Oversell protection verified. Exactly 5 seats booked out of 50 requests.`);
    } else {
      console.error(`🔴 TEST FAILED! Expected 5 successes and 5 seats booked, got ${successes.length} successes.`);
    }
  } catch (error) {
    console.error('Test script encountered an error:', error);
  } finally {
    process.exit(0);
  }
}

runConcurrencyTest();