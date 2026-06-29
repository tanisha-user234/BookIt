# dev notes

## how I stop overselling tickets
to make sure tickets don't get oversold when many people try to book at the same time, I lock the event row in the database.
when booking, the backend starts a database transaction and runs:
`select capacity, seats_booked from events where id = ? for update;`
this locks the event row. if another request comes in, it has to wait until the first one is finished and committed.
inside this lock, I check if seats_booked is less than capacity. if it is full, I throw a sold out error. otherwise, I create the booking and increment seats_booked by 1, then commit the transaction and release the lock.
I also added a unique constraint on (user_id, event_id) in the bookings table so a user can't buy two tickets for the same event.

## schema and indexing
* schema is simple: users, events, bookings, and activity logs.
* indexes: I added indexes on events(title) to speed up searching events by name, and events(date_time) to make date filtering fast.

## ai stuff and disagreements
I used ai to assist me in some parts of UI and writing clean readme.md file.
disagreed with ai on:
1. npm workspaces: ai wanted to link packages under one root lockfile, but I kept them separate with prefix flags because merging express and next.js packages can mess up node modules.
2. auto seeding: ai templates suggested running database seed on every server start. I turned this off because seeds clear the tables and would wipe out database progress.
3. progress bar layout: ai thought the progress bar was desynced because it looked too wide for a small number like 2/1000. it is just the rounded corners of tailwind progress bar requiring a minimum width to render properly.
