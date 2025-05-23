import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { auth } from '../middlewares/auth.middleware';

const eventRouter = Router();

eventRouter.get('/my-events', auth, EventController.getMyEvents);
eventRouter.get('/:id', auth, EventController.getEventById);
eventRouter.get('/tag/:tagId', auth, EventController.getEventsByTag);
eventRouter.get('/user', auth, EventController.getCreatedByUserEvents);

eventRouter.post('/:calendarId/event', auth, EventController.addEventToCalendar);

eventRouter.patch('/:id', auth, EventController.updateEvent);

eventRouter.delete('/:id', auth, EventController.deleteEvent);

export default eventRouter;
