import { Router, Request, Response } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { auth } from '../middlewares/auth.middleware';

const calendarRouter = Router();

calendarRouter.get('/shared-calendars', auth, CalendarController.getAvaibleSharedCalendars);
calendarRouter.get('/my-calendars', auth, CalendarController.getMyCalendars);
calendarRouter.get('/:id', auth, CalendarController.getCalendarById);
calendarRouter.get('/:id/events', auth, CalendarController.getAllEventsForCalendar);
calendarRouter.get('/:id/visitor', auth, CalendarController.getVisitorsForCalendar);

calendarRouter.post('/', auth, CalendarController.createCalendar);
calendarRouter.post('/:id/event', auth, CalendarController.createEvent);
calendarRouter.post('/:id/share', auth, CalendarController.shareCalendar);
calendarRouter.post('/:id/visitor', auth, CalendarController.addVisitorToCalendar);

calendarRouter.patch('/:id/visitor/role', auth, CalendarController.setRole);
calendarRouter.patch('/:id', auth, CalendarController.updateCalendar);

calendarRouter.delete('/:id', auth, CalendarController.deleteCalendar);
calendarRouter.delete('/:id/visitor', auth, CalendarController.removeVisitorFromCalendar);

export default calendarRouter;
