import { Request, Response } from 'express';
import { CalendarService } from '../services/calendar.service';
import { EventService } from '../services/event.service';
import { BadRequestError, ForbiddenError, UnauthorizedError, NotFoundError } from '../utils/http-errors';
import { StatusCodes } from 'http-status-codes';
import { queryOptionsDto, QueryOptions } from '../dto/query-options.dto';
import { createEventDto, updateEventDto } from '../dto/event.dto';
import { Paginator } from '../utils/paginator';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';


export class CalendarController {
    private static calendarService = new CalendarService();
    private static eventService = new EventService();
    private static userService = new UserService();

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

    public static async getAvaibleSharedCalendars(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const userId = req.user.id;
        const user = await CalendarController.userService.getUserById(userId);
        const calendars = user.sharedCalendars;
        return res.status(StatusCodes.OK).json(calendars);
    }

    public static async getMyCalendars(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const userId = req.user.id;
        const user = await CalendarController.userService.getUserById(userId);
        const calendars = await CalendarController.calendarService.getMyCalendars(user);
        return res.status(StatusCodes.OK).json(calendars);
    }
    

    public static async getAllEventsForCalendar(req: Request, res: Response) {
        const queryOptions = CalendarController.validateQueryDto(req);
        const calendar_id = parseInt(req.params.id, 10);
        
        if (!calendar_id) {
            throw new BadRequestError('Calendar ID is required');
        }
        
        queryOptions.filters = { calendar_id: calendar_id };

        const events = await CalendarController.eventService.getAllEvents(queryOptions);
        return res.status(StatusCodes.OK).json(events);
    }

    public static async createEvent(req: Request, res: Response) {
        const eventDto = await createEventDto.validateAsync(req.body);
        const creatorID = req.user?.id;
        const calendarId = parseInt(req.params.id, 10);

        if (!creatorID) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        const newEvent = await CalendarController.eventService.createEvent(eventDto, creatorID, calendarId);

        return res.status(StatusCodes.CREATED).json({ data: newEvent });
    }

    public static async shareCalendar(req: Request, res: Response) {
        const calendarId = parseInt(req.params.id, 10);
        let usersId: number[] = [];
        for (let i = 0; i < req.body.usersId.length; i++) {
            usersId.push(parseInt(req.body.usersId[i]));
        }
        const sharedCalendar = await CalendarController.calendarService.shareCalendar(calendarId, usersId);

        return res.status(StatusCodes.CREATED).json({ data: sharedCalendar });
    }

  
}
