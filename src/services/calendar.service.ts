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

export const enum ServiceMethod {
    update,
    create,
}

export class CalendarService {
    private calendarRepository: Repository<Calendar>;
    private eventRepository: Repository<Event> = AppDataSource.getRepository(Event);
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
            ...dto.value,
            owner: user
        }

        console.log(newCalendarData);

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
            relations: ['visitors', 'events'], // Load related entities if needed
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

    public async deleteCalendar(id: number): Promise<boolean> {
        try {
            const calendar = await this.getCalendarById(id);
            await this.calendarRepository
                .createQueryBuilder()
                .relation(Calendar, "visitors")
                .of(calendar)
                .remove(calendar.visitors);
            await this.eventRepository.delete({ calendar: { id: id } });
            await this.calendarRepository.remove(calendar);
            return true;
        } catch (error) {
            console.error('Error deleting calendar:', error);
            throw new Error('Unable to delete calendar due to existing dependencies.');
        }
    }

    public async addVisitorToCalendar(calendarId: number, visitorId: number): Promise<Calendar> {
        const calendar = await this.getCalendarById(calendarId);
        const visitor = await AppDataSource.getRepository(User).findOneBy({id: visitorId});

        if (!visitor) {
            throw new NotFoundError('Visitor not found');
        }

        calendar.visitors?.push(visitor);
        return this.calendarRepository.save(calendar);
    }

    public async removeVisitorFromCalendar(calendarId: number, visitorId: number): Promise<Calendar> {
        const calendar = await this.getCalendarById(calendarId);
        calendar.visitors = calendar.visitors?.filter((visitor) => visitor.id !== visitorId);

        return this.calendarRepository.save(calendar);
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
        const calendars = await AppDataSource.getRepository(Calendar).find({
            where: { owner: { id: user.id } },
            relations: ['visitors'],
        });
        return calendars;
    }

    public async shareCalendar(calendarId: number, visitorsIds: number[]): Promise<Calendar> {
        const calendar = await this.getCalendarById(calendarId);
        const visitors = await AppDataSource.getRepository(User).findBy({ id: In(visitorsIds || []) });
        
        if (visitors.length > 0) {
            for (const visitor of visitors) {
                if (visitor.id === calendar.owner.id) {
                    throw new BadRequestError('Owner cannot be a visitor');
                }
                if (!calendar.visitors?.includes(visitor)) {
                    calendar.visitors?.push(visitor);
                }
            }
            return this.calendarRepository.save(calendar);
        }
    
        throw new NotFoundError('No visitors found');
    }

    public async checkVisitor(calendarId: number, visitorId: number) : Promise<boolean>
    {
        const calendar = await this.getCalendarById(calendarId);
        const visitor = await AppDataSource.getRepository(User).findOneBy({id: visitorId});
        if(visitor)
        {
            return calendar.visitors? calendar.visitors.includes(visitor) : false;
        }
        return false;

    }
}

