import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- 1. Create Users Table
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Create Events Table
    CREATE TABLE events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      venue VARCHAR(255) NOT NULL,
      date_time TIMESTAMP NOT NULL,
      capacity INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      seats_booked INTEGER NOT NULL DEFAULT 0,
      organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Performance Indexes on Events table
    CREATE INDEX idx_events_title ON events(title);
    CREATE INDEX idx_events_date_time ON events(date_time);

    -- 3. Create Bookings Table
    CREATE TABLE bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    );

    -- 4. Create Activity Log Table (append-only)
    CREATE TABLE activity_log (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      action VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse-dependency order
  await knex.raw(`
    DROP TABLE IF EXISTS activity_log;
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS users;
  `);
}