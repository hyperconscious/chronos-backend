import { LessThanOrEqual, Repository } from 'typeorm';
import { BadRequestError, NotFoundError } from '../utils/http-errors';
import { Event } from '../entities/event.entity';
import { AppDataSource } from '../config/orm.config';
import { createEventDto, updateEventDto } from '../dto/event.dto';
import { Paginator, QueryOptions } from '../utils/paginator';
import { User } from '../entities/user.entity';
import { Calendar } from '../entities/calendar.entity';
import { UserInCalendar } from '../entities/userInCalendar.entity';

export const enum ServiceMethod {
  create,
  update,
}

export class EventService {
  private eventRepository: Repository<Event>;

  constructor() {
    this.eventRepository = AppDataSource.getRepository(Event);
  }

  private validateEventDTO(eventData: Partial<Event>, method: ServiceMethod) {
    const dto = method === ServiceMethod.create ? createEventDto : updateEventDto;
    const { error } = dto.validate(eventData, { abortEarly: false });

    if (error) {
      throw new BadRequestError(
        error.details.map((detail) => detail.message).join('; '),
      );
    }
  }

  public async createEvent(eventData: Partial<Event>, creator_id: number, calendar_id: number): Promise<Event> {
    this.validateEventDTO(eventData, ServiceMethod.create);
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: creator_id } });
    const calendar = await AppDataSource.getRepository(Calendar).findOne({ where: { id: calendar_id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (!calendar) {
      throw new NotFoundError('Calendar not found');
    }

    const newEvent = this.eventRepository.create({
      ...eventData,
      creator: user,
      calendar: calendar,
    });

    return this.eventRepository.save(newEvent);
  }

  public async createEventForCalendars(eventData: Partial<Event>, creator_id: number, calendars: Calendar[]): Promise<Event[]> {
    let events: Event[] = [];
    for (const calendar of calendars) {
        events.push(await this.createEvent(eventData, creator_id, calendar.id));
    }
    return events;
  }

  public async getEventsStartingAt(date: Date): Promise<Event[]> {
    const events = await this.eventRepository.find({
      where: { startTime: LessThanOrEqual(date), isNotifiedStart: false },
      relations: ['calendar'],

    });

    return events;
  }

  public async updateEventTimeRange(event: Event, newStart: Date, newEnd: Date)
  {
    event.startTime = newStart;
    event.endTime = newEnd;
    return this.eventRepository.save(event);
  }

  public async getEventsEndingAt(date: Date): Promise<Event[]> {
    const events = await this.eventRepository.find({
      where: { endTime: LessThanOrEqual(date), isNotifiedEnd: false },
      relations: ['calendar'],
    });

    return events;
  }

  public async markEventAsNotified(event: Event): Promise<Event> {
    event.isNotifiedStart = true;
    return this.eventRepository.save(event);
  }

  public async markEventAsCompleted(event: Event): Promise<Event> {
    event.isNotifiedEnd = true;
    return this.eventRepository.save(event);
  }

  public async updateEvent(id: number, eventData: Partial<Event>): Promise<Event> {
    this.validateEventDTO(eventData, ServiceMethod.update);

    const event = await this.getEventById(id);

    const updatedEvent = this.eventRepository.merge(event, eventData);

    return this.eventRepository.save(updatedEvent);
  }

  public async getEventById(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator', 'calendars'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  public async getAllEvents(
    queryOptions: QueryOptions,
  ): Promise<{ items: Event[]; total: number }> {
    queryOptions.searchType = 'event';
    queryOptions.sortField = queryOptions.sortField || 'createdAt';
    const queryBuilder = this.eventRepository.createQueryBuilder('event');
    const paginator = new Paginator<Event>(queryOptions);
    return await paginator.paginate(queryBuilder);
  }

  public async getAllEventsOfUser(
    userId: number,
  ): Promise<Event[]> {
    const userInCalendar = await AppDataSource.getRepository(UserInCalendar).find({
      where: { user: { id: userId } },
      relations: ['calendar'],
    });
    let events: Event[] = [];
    for (const user of userInCalendar) {
      const calendar = user.calendar;
      events = events.concat(await this.eventRepository.find({
        where: { calendar: { id: calendar.id } },
        relations: ['creator'],
      }));
    }

    return events
  }

  public async deleteEvent(id: number): Promise<boolean> {
    try {
      const event = await this.getEventById(id);
      await this.eventRepository.remove(event);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Unable to delete event due to existing dependencies.');
    }
  }

  public async getEventsByCreator(userId: number): Promise<Event[]> {
    const events = await this.eventRepository.find({
      where: { creator: { id: userId } },
      relations: ['creator', 'calendars'],
    });

    return events;
  }


}
