import { Router, Request, Response } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { auth } from '../middlewares/auth.middleware';

const calendarRouter = Router();

calendarRouter.get('/shared-calendars', auth, CalendarController.getAvaibleSharedCalendars);
calendarRouter.get('/my-calendars', auth, CalendarController.getMyCalendars);
calendarRouter.get('/:id/events', auth, CalendarController.getAllEventsForCalendar);

calendarRouter.post('/:id/event', auth, CalendarController.createEvent);
calendarRouter.post('/:id/share', auth, CalendarController.shareCalendar);


export default calendarRouter;
