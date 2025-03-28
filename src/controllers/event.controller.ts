import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { UserService } from '../services/user.service';
import { CalendarService } from '../services/calendar.service';
import { BadRequestError, ForbiddenError, UnauthorizedError, NotFoundError } from '../utils/http-errors';
import { StatusCodes } from 'http-status-codes';
import { queryOptionsDto, QueryOptions } from '../dto/query-options.dto';
import { createEventDto, updateEventDto } from '../dto/event.dto';
import { Paginator } from '../utils/paginator';
import { UserRole } from '../entities/userInCalendar.entity';

export class EventController {
    private static eventService = new EventService();
    private static userService = new UserService();
    private static calendarService = new CalendarService();

    private static validateQueryDto(req: Request): QueryOptions {
        const { error, value: queryOptions } = queryOptionsDto.validate(req.query, {
            abortEarly: false,
        });
        if (error) {
            throw new BadRequestError(
                error.details.map((detail) => detail.message).join('; '),
            );
        }
        return queryOptions;
    }

    public static async getMyEvents(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const events = await EventController.eventService.getAllEventsOfUser(req.user.id);
        return res.status(StatusCodes.OK).json(events);
    }

    public static async getEventById(req: Request, res: Response) {
        const eventId = parseInt(req.params.id, 10);
        if (!eventId) {
            throw new BadRequestError('Event ID is required');
        }

        const event = await EventController.eventService.getEventById(eventId);
        return res.status(StatusCodes.OK).json(event);
    }

    public static async updateEvent(req: Request, res: Response) {
        const eventId = parseInt(req.params.id, 10);
        if (!eventId) {
            throw new BadRequestError('Event ID is required');
        }

        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        // Validate event data
        const eventDto = await updateEventDto.validateAsync(req.body);

        // Check if the user is the event creator
        const event = await EventController.eventService.getEventById(eventId);
        const userInCalendar = await EventController.calendarService.checkUser(event.calendar.id, req.user.id);
        if (!userInCalendar || (userInCalendar.role !== UserRole.owner && userInCalendar.role !== UserRole.admin && userInCalendar.role !== UserRole.editor)) {
            throw new ForbiddenError('You are not allowed to update this event.');
        }

        const updatedEvent = await EventController.eventService.updateEvent(eventId, eventDto);
        return res.status(StatusCodes.OK).json(updatedEvent);
    }

    public static async deleteEvent(req: Request, res: Response) {
        const eventId = parseInt(req.params.id, 10);

        if (!eventId) {
            throw new BadRequestError('Event ID is required');
        }

        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        // Check if the user is the event creator
        const event = await EventController.eventService.getEventById(eventId);

        if (event.creator.id !== req.user.id) {
            throw new ForbiddenError('You are not allowed to delete this event.');
        }

        await EventController.eventService.deleteEvent(eventId);
        return res.status(StatusCodes.NO_CONTENT).json();
    }

    public static async addEventToCalendar(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        const calendarId = parseInt(req.params.calendarId, 10);
        const eventDto = await createEventDto.validateAsync(req.body);

        const UserInCalendar = await EventController.calendarService.checkUser(calendarId, req.user.id);

        if (!UserInCalendar || (UserInCalendar.role !== UserRole.owner && UserInCalendar.role !== UserRole.admin && UserInCalendar.role !== UserRole.editor)) {
            throw new ForbiddenError('You do not have permission to add events to this calendar.');
        }

        const newEvent = await EventController.eventService.createEvent(eventDto, req.user.id, calendarId);
        return res.status(StatusCodes.CREATED).json({ data: newEvent });
    }

    public static async getEventsByTag(req: Request, res: Response) {
        const queryOptions = EventController.validateQueryDto(req);
        const tagId = parseInt(req.params.tagId, 10);

        if (!tagId) {
            throw new BadRequestError('Tag ID is required');
        }

        queryOptions.filters = { tagId };

        const events = await EventController.eventService.getAllEvents(queryOptions);
        return res.status(StatusCodes.OK).json(events);
    }

    public static async getCreatedByUserEvents(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        const queryOptions = EventController.validateQueryDto(req);
        queryOptions.filters = { creatorId: req.user.id };

        const events = await EventController.eventService.getAllEvents(queryOptions);
        return res.status(StatusCodes.OK).json(events);
    }
}