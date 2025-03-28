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
import { UserRole } from '../entities/userInCalendar.entity';


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

    public static async createCalendar(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const calendarDto = req.body;
        const creatorID = req.user.id;
        const newCalendar = await CalendarController.calendarService.createCalendar(calendarDto, creatorID);
        return res.status(StatusCodes.CREATED).json({ data: newCalendar });
    }

    public static async getAvaibleSharedCalendars(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const userId = req.user.id;
        const user = await CalendarController.userService.getUserById(userId);
        //const calendars = await CalendarController.userService.getSharableCalendars(user);;
        const calendars = user.calendarsRole;
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
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const queryOptions = CalendarController.validateQueryDto(req);
        const calendar_id = parseInt(req.params.id, 10);
        if (!calendar_id) {
            throw new BadRequestError('Calendar ID is required');
        }
        const UserInCalendar = await CalendarController.calendarService.checkUser(calendar_id, req.user.id);

        if (!UserInCalendar) {
            throw new ForbiddenError('You are not allowed to see events in this calendar.');
        }
        queryOptions.filters = { calendar_id: calendar_id };

        const events = await CalendarController.eventService.getAllEvents(queryOptions);
        return res.status(StatusCodes.OK).json(events);
    }

    public static async createEvent(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const eventDto = await createEventDto.validateAsync(req.body);
        const creatorID = req.user?.id;
        const calendarId = parseInt(req.params.id, 10);

        const UserInCalendar = await CalendarController.calendarService.checkUser(calendarId, req.user.id);

        if (!UserInCalendar || (UserInCalendar.role !== UserRole.owner && UserInCalendar.role !== UserRole.admin && UserInCalendar.role !== UserRole.editor)) {
            throw new ForbiddenError('You are not allowed to create events in this calendar.');
        }

        const newEvent = await CalendarController.eventService.createEvent(eventDto, creatorID, calendarId);

        return res.status(StatusCodes.CREATED).json({ data: newEvent });
    }

    public static async shareCalendar(req: Request, res: Response) {

        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        const calendarId = parseInt(req.params.id, 10);
        const UserInCalendar = await CalendarController.calendarService.checkUser(calendarId, req.user.id);

        if (!UserInCalendar || (UserInCalendar.role !== UserRole.owner && UserInCalendar.role !== UserRole.admin)) {
            throw new ForbiddenError('You are not allowed to share this calendar.');
        }

        let usersId: number[] = [];
        for (let i = 0; i < req.body.usersId.length; i++) {
            usersId.push(parseInt(req.body.usersId[i]));
        }
        
        const sharedCalendar = await CalendarController.calendarService.shareCalendar(calendarId, usersId);

        return res.status(StatusCodes.CREATED).json({ data: sharedCalendar });
    }

    public static async getCalendarById(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const calendarId = parseInt(req.params.id, 10);
        if (!calendarId) {
            throw new BadRequestError('Calendar ID is required');
        }
        const UserInCalendar = await CalendarController.calendarService.checkUser(calendarId, req.user.id);
        if (!UserInCalendar) {
            throw new ForbiddenError('You are not allowed to see this calendar.');
        }
        const calendar = await CalendarController.calendarService.getCalendarById(calendarId);
        return res.status(StatusCodes.OK).json(calendar);
    }

    public static async updateCalendar(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const calendarId = parseInt(req.params.id, 10);
        if (!calendarId) {
            throw new BadRequestError('Calendar ID is required');
        }

        const UserInCalendar = await CalendarController.calendarService.checkUser(calendarId, req.user.id);
        if (!UserInCalendar || (UserInCalendar.role !== UserRole.owner && UserInCalendar.role !== UserRole.admin)) {
            throw new ForbiddenError('You are not allowed to update this calendar.');
        }
        const calendarDto = req.body;
        const updatedCalendar = await CalendarController.calendarService.updateCalendar(calendarId, calendarDto);
        return res.status(StatusCodes.OK).json(updatedCalendar);
    }

    public static async deleteCalendar(req: Request, res: Response) {
        const calendarId = parseInt(req.params.id, 10);

        if (!calendarId) {
            throw new BadRequestError('Calendar ID is required');
        }
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }

        const UserInCalendar = await CalendarController.calendarService.checkUser(calendarId, req.user.id);
        if (!UserInCalendar || (UserInCalendar.role !== UserRole.owner && UserInCalendar.role !== UserRole.admin)) {
            throw new ForbiddenError('You are not allowed to delete this calendar.');
        }

        await CalendarController.calendarService.deleteCalendar(calendarId);
        return res.status(StatusCodes.NO_CONTENT).json();
    }

    public static async checkVisitor(req: Request, res: Response) {
        const calendarId = parseInt(req.params.id, 10);
        const visitorId = parseInt(req.body.visitorId, 10);
        if (!calendarId || !visitorId) {
            throw new BadRequestError('Calendar ID and visitor ID are required');
        }
        const calendar = await CalendarController.calendarService.checkUser(calendarId, visitorId);
        return res.status(StatusCodes.OK).json(calendar);
    }

    public static async addVisitorToCalendar(req: Request, res: Response) {
        const calendarId = parseInt(req.params.id, 10);
        const visitorId = parseInt(req.body.visitorId, 10);
        if (!calendarId || !visitorId) {
            throw new BadRequestError('Calendar ID and visitor ID are required');
        }
        const calendar = await CalendarController.calendarService.addUserToCalendar(calendarId, visitorId);
        return res.status(StatusCodes.OK).json(calendar);
    }

    public static async removeVisitorFromCalendar(req: Request, res: Response) {
        const calendarId = parseInt(req.params.id, 10);
        const visitorId = parseInt(req.body.visitorId, 10);
        if (!calendarId || !visitorId) {
            throw new BadRequestError('Calendar ID and visitor ID are required');
        }
        const calendar = await CalendarController.calendarService.removeUserFromCalendar(calendarId, visitorId);
        return res.status(StatusCodes.OK).json(calendar);
    }

    public static async setOwner(req: Request, res: Response) {
        const calendarId = parseInt(req.params.id, 10);
        const ownerId = parseInt(req.body.ownerId, 10);
        if (!calendarId || !ownerId) {
            throw new BadRequestError('Calendar ID and owner ID are required');
        }
        const calendar = await CalendarController.calendarService.setOwner(calendarId, ownerId);
        return res.status(StatusCodes.OK).json(calendar);
    }

    public static async setRole(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const calendarId = parseInt(req.params.id, 10);

        const meInCalendar = await CalendarController.calendarService.checkUser(calendarId, req.user.id);

        if (!meInCalendar || (meInCalendar.role !== UserRole.owner && meInCalendar.role !== UserRole.admin)) {
            throw new ForbiddenError('You are not allowed to set role in this calendar.');
        }
        const userId = parseInt(req.body.userId, 10);
        const role = req.body.role;
        if (!calendarId || !userId || !role) {
            throw new BadRequestError('Calendar ID, user ID and role are required');
        }
        const userInCalendar = await CalendarController.calendarService.checkUser(calendarId, userId);
        const calendar = await CalendarController.calendarService.setRole(calendarId, userId, role);
        return res.status(StatusCodes.OK).json(calendar);
    }
}
