import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import Controller functions
import * as authController from './controllers/authControllers';
import * as eventController from './controllers/eventController';
import * as bookingController from './controllers/bookingContoller';
import * as analyticsController from './controllers/analyticsController';

// Import Middleware
import { authenticate, authorize } from './middleware/auth';
import { startHoldCleanUpJob } from './jobs/cleanupHolds';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to BookIt Live Event Booking Platform API!' });
});

// Auth Routing
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);

// Browsing Routing
app.get('/api/events', eventController.getEvents);
app.get('/api/events/:id', eventController.getEventById);

// User Bookings Routing
app.post('/api/events/:id/book', authenticate as any, bookingController.bookEvent as any);
app.post('/api/bookings/:id/confirm',authenticate,bookingController.confirmBooking)
app.delete('/api/bookings/:id', authenticate as any, bookingController.cancelBooking as any);

//  Organizer Dashboard Routing
app.post('/api/organizer/events', authenticate as any, authorize('organizer') as any, eventController.createEvent as any);
app.get('/api/organizer/events', authenticate as any, authorize('organizer') as any, eventController.getOrganizerEvents as any);
app.get('/api/organizer/events/:id/attendees', authenticate as any, authorize('organizer') as any, eventController.getEventAttendees as any);
app.get('/api/organizer/events/:id/analytics', authenticate as any, authorize('organizer') as any, analyticsController.getEventAnalytics as any);

//  Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  //start this cleanup as soon as the server starts 
  startHoldCleanUpJob();
});