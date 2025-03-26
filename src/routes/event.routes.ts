import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { auth } from '../middlewares/auth.middleware';

const eventRouter = Router();

eventRouter.get('/', auth, EventController.getAllEvents);
eventRouter.get('/:id', auth, EventController.getEventById);
eventRouter.get('/tag/:tagId', auth, EventController.getEventsByTag);
eventRouter.get('/user', auth, EventController.getUserEvents);

eventRouter.post('/:calendarId/event', auth, EventController.addEventToCalendar);

eventRouter.put('/:id', auth, EventController.updateEvent);

eventRouter.delete('/:id', auth, EventController.deleteEvent);

export default eventRouter;
