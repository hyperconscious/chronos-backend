import { In, Repository } from 'typeorm';
import { BadRequestError, NotFoundError } from '../utils/http-errors';
import { Calendar } from '../entities/calendar.entity';
import { AppDataSource } from '../config/orm.config';
import { createCalendarDto, updateCalendarDto } from '../dto/calendar.dto';
import { Paginator, QueryOptions } from '../utils/paginator';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';
import { UserService } from './user.service';
import { create } from 'domain';
import { UserInCalendar, UserRole } from '../entities/userInCalendar.entity';

export const enum ServiceMethod {
    update,
    create,
}

export class CalendarService {
    private calendarRepository: Repository<Calendar>;
    private eventRepository: Repository<Event> = AppDataSource.getRepository(Event);
    private userInCalendarRepository: Repository<UserInCalendar> = AppDataSource.getRepository(UserInCalendar);
    private userService: UserService = new UserService();

    constructor() {
        this.calendarRepository = AppDataSource.getRepository(Calendar);
    }

    private validateCalendarDTO(calendarData: Partial<Calendar>, method: ServiceMethod) {
        const dto = method === ServiceMethod.create ? createCalendarDto : updateCalendarDto;
        const { error } = dto.validate(calendarData, { abortEarly: false });

        if (error) {
        throw new BadRequestError(
            error.details.map((detail) => detail.message).join('; '),
        );
        }
    }

    public async createCalendar(calendarData: Partial<Calendar>, ownerId: number): Promise<Calendar> {
        const dto = createCalendarDto.validate(calendarData, { abortEarly: false });
        const user = await this.userService.getUserById(ownerId);

        const newCalendarData : Calendar =
        {
            ...dto.value
        }


        const newCalendar = this.calendarRepository.create(newCalendarData);

        return this.calendarRepository.save(newCalendar);
    }

    public async updateCalendar(id: number, calendarData: Partial<Calendar>): Promise<Calendar> {
        this.validateCalendarDTO(calendarData, ServiceMethod.update);

        const calendar = await this.getCalendarById(id);

        const updatedCalendar = this.calendarRepository.merge(calendar, calendarData);

        return this.calendarRepository.save(updatedCalendar);
    }

    public async getCalendarById(id: number): Promise<Calendar> {
        const calendar = await this.calendarRepository.findOne({
            where: { id },
            //relations: ['users', 'events'],
        });
        if (!calendar) {
            throw new NotFoundError('Calendar not found');
        }
        return calendar;
    }

    public async getAllCalendars(
        queryOptions: QueryOptions,
    ): Promise<{ items: Calendar[]; total: number }> {
        queryOptions.searchType = 'calendar';
        queryOptions.sortField = queryOptions.sortField || 'createdAt';
        const queryBuilder = this.calendarRepository.createQueryBuilder('calendar');
        const paginator = new Paginator<Calendar>(queryOptions);
        return await paginator.paginate(queryBuilder);
    }

    public async getCalendarOwner(calendar_id: number): Promise<UserInCalendar> {

        const owner = await AppDataSource.getRepository(UserInCalendar).findOne(
            {
                where: {calendar: {id: calendar_id}, role: UserRole.owner},
                relations: ['user']
            }
        );
        if(!owner)
        {
            throw new NotFoundError('Owner not found');
        }
        return owner;
    }

    public async deleteCalendar(id: number) {
        try {
            const calendar = await this.getCalendarById(id);
            await this.userInCalendarRepository.delete({ calendar: { id: id } });
            await this.eventRepository.delete({ calendar: { id: id } });
            await this.calendarRepository.remove(calendar);
            return true;
        } catch (error) {
            console.error('Error deleting calendar:', error);
            throw new Error('Unable to delete calendar due to existing dependencies.');
        }
    }

    public async deleteAllCalendarsOfUser(userId: number) {
        try {
            const calendars = await AppDataSource.getRepository(UserInCalendar).findBy({ user: { id: userId }, role: UserRole.owner});
            for (const calendar of calendars) {
                this.deleteCalendar(calendar.calendar.id);
            }
            return true;
        } catch (error) {
            console.error('Error deleting calendar:', error);
            throw new Error('Unable to delete calendar due to existing dependencies.');
        }
    }

    public async addUserToCalendar(calendarId: number, userId: number, role: UserRole = UserRole.visitor): Promise<UserInCalendar> {
        const calendar = await this.getCalendarById(calendarId);
        const user = await AppDataSource.getRepository(User).findOneBy({id: userId});
        if (!user) {
            throw new NotFoundError('User not found');
        }
        const userToAdd = await AppDataSource.getRepository(UserInCalendar).create({
            calendar: calendar,
            user: user,
            role: role
        });

        return await AppDataSource.getRepository(UserInCalendar).save(userToAdd);
    }

    public async removeUserFromCalendar(calendarId: number, userId: number): Promise<void> {
        const calendar = await this.getCalendarById(calendarId);
        const user = await AppDataSource.getRepository(User).findOneBy({id: userId});
        if (!user) {
            throw new NotFoundError('User not found');
        }
        const objToDelete = await AppDataSource.getRepository(UserInCalendar).findOne({
            where: {calendar: {id: calendarId}, user: {id: userId}}
        });

        if(objToDelete == null)
        {
            throw new NotFoundError('User not found in calendar');
        }

        if(objToDelete.role === UserRole.owner)
        {
            throw new BadRequestError('Owner cannot be removed from calendar');
        }

        await AppDataSource.getRepository(UserInCalendar).delete({calendar: calendar, user: user});
    }

    public async addEventToCalendar(calendarId: number, eventId: number): Promise<Calendar> {
        const calendar = await this.getCalendarById(calendarId);
        const event = await AppDataSource.getRepository(Event).findOneBy({id: eventId});

        if (!event) {
            throw new NotFoundError('Event not found');
        }

        calendar.events?.push(event);
        return this.calendarRepository.save(calendar);
    }

    public async removeEventFromCalendar(calendarId: number, eventId: number): Promise<Calendar> {
        const calendar = await this.getCalendarById(calendarId);
        calendar.events = calendar.events?.filter((event) => event.id !== eventId);

        return this.calendarRepository.save(calendar);
    }

    public async getMyCalendars(user: User): Promise<any> {
        const calendars = await AppDataSource.getRepository(UserInCalendar).find({
            where: { user: { id: user.id }, role: UserRole.owner },
            relations: ['users'],
        });
        return calendars;
    }

    public async shareCalendar(calendarId: number, usersIds: number[]): Promise<Calendar> {
        const calendar = await this.getCalendarById(calendarId);
        const visitors = await AppDataSource.getRepository(User).findBy({ id: In(usersIds || []) });

        if (visitors.length > 0) {
            for (const visitor of visitors) {
                const roleData: Partial<UserInCalendar> = {
                    calendar: calendar,
                    role: UserRole.visitor,
                    user: visitor,
                }
                const isExists = await AppDataSource.getRepository(UserInCalendar).findOne({
                    where: {calendar: {id: calendarId}, user: {id: visitor.id}},});
                if (isExists) {
                    throw new BadRequestError('User already exists in calendar');
                }
                await AppDataSource.getRepository(UserInCalendar).create(roleData);
            }
            return this.calendarRepository.save(calendar);
        }
        throw new NotFoundError('No users found');
    }

    public async checkUser(calendarId: number, visitorId: number) : Promise<UserInCalendar | null>
    {
        return await AppDataSource.getRepository(UserInCalendar).findOne(
            {
                where:
                {
                    calendar: {id: calendarId},
                    user: {id: visitorId},
                },

                relations: ['user', 'calendar']
            });
    }

    public async setOwner(calendarId: number, userId: number) : Promise<UserInCalendar>
    {
        const owners = await AppDataSource.getRepository(UserInCalendar).find(
            {
                where: {calendar: {id: calendarId}, role: UserRole.owner},
                relations: ['user', 'calendar']
            });

        const calendar = await this.getCalendarById(calendarId);
        const user = await AppDataSource.getRepository(User).findOneBy({id: userId});

        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (!calendar) {
            throw new NotFoundError('Calendar not found');
        }
        const userInCalendar = await AppDataSource.getRepository(UserInCalendar).findOne(
            {
                where: {calendar: {id: calendarId}
                , user: {id: userId}},
                relations: ['user', 'calendar']
            });

        if(userInCalendar)
        {
            userInCalendar.role = UserRole.owner;
            return await AppDataSource.getRepository(UserInCalendar).save(userInCalendar);
        }
        else
        {
            throw new NotFoundError('User not found in calendar');
        }
    }
}

