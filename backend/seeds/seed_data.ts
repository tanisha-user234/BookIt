import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in reverse dependency order
  await knex('activity_log').del();
  await knex('bookings').del();
  await knex('events').del();
  await knex('users').del();

  // Create hashed password for seed users
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Insert Users
  const users = await knex('users').insert([
    {
      email: 'admin@bookit.com',
      password_hash: passwordHash,
      role: 'admin',
    },
    {
      email: 'organizer@bookit.com',
      password_hash: passwordHash,
      role: 'organizer',
    },
    {
      email: 'user1@bookit.com',
      password_hash: passwordHash,
      role: 'user',
    },
    {
      email: 'user2@bookit.com',
      password_hash: passwordHash,
      role: 'user',
    },
  ]).returning(['id', 'email', 'role']);

  const organizer = users.find((u) => u.role === 'organizer');
  const user1 = users.find((u) => u.email === 'user1@bookit.com');
  const user2 = users.find((u) => u.email === 'user2@bookit.com');

  const organizerId = organizer ? organizer.id : 1;

  // Insert Events
  const events = await knex('events').insert([
    {
      title: 'Rock Concert 2026',
      description: 'An amazing outdoor rock concert featuring top bands.',
      venue: 'Central Park Arena',
      date_time: new Date('2026-07-15T19:00:00Z'),
      capacity: 500,
      price: 49.99,
      seats_booked: 2,
      organizer_id: organizerId,
    },
    {
      title: 'Tech Summit 2026',
      description: 'A conference showcasing the latest in AI and agentic workflows.',
      venue: 'Silicon Valley Convention Center',
      date_time: new Date('2026-08-20T09:00:00Z'),
      capacity: 1000,
      price: 299.00,
      seats_booked: 1,
      organizer_id: organizerId,
    },
    {
      title: 'Local Standup Comedy Night',
      description: 'Laughter therapy with the funniest local comedians.',
      venue: 'The Laugh Club',
      date_time: new Date('2026-06-30T20:30:00Z'),
      capacity: 50,
      price: 15.00,
      seats_booked: 0,
      organizer_id: organizerId,
    },
  ]).returning(['id', 'title']);

  const rockConcert = events.find((e) => e.title === 'Rock Concert 2026');
  const techSummit = events.find((e) => e.title === 'Tech Summit 2026');

  // Insert Bookings & Activity Logs
  if (user1 && rockConcert && user2 && techSummit) {
    await knex('bookings').insert([
      {
        user_id: user1.id,
        event_id: rockConcert.id,
        status: 'CONFIRMED',
      },
      {
        user_id: user2.id,
        event_id: rockConcert.id,
        status: 'CONFIRMED',
      },
      {
        user_id: user1.id,
        event_id: techSummit.id,
        status: 'CONFIRMED',
      },
    ]);

    await knex('activity_log').insert([
      {
        event_id: rockConcert.id,
        action: 'CREATED',
      },
      {
        event_id: techSummit.id,
        action: 'CREATED',
      },
    ]);
  }
}
