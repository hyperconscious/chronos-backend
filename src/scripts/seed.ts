import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Calendar } from '../entities/calendar.entity';
import { Event, EventType, EventRecurrence } from '../entities/event.entity';
import { Tag } from '../entities/tag.entity';
import { Notification, NotificationType } from '../entities/notification.entity';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/orm.config';

export class DatabaseSeeder {
    static async seed(dataSource: DataSource) {
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

            const tables = [
                'notification', 
                'event_tags_tag', 
                'event', 
                'tag', 
                'calendar', 
                'user'
            ];
            
            for (const table of tables) {
                await queryRunner.query(`TRUNCATE TABLE ${table}`);
            }

            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

            const userRepository = dataSource.getRepository(User);
            const calendarRepository = dataSource.getRepository(Calendar);
            const tagRepository = dataSource.getRepository(Tag);
            const eventRepository = dataSource.getRepository(Event);
            const notificationRepository = dataSource.getRepository(Notification);

            const users = [
                userRepository.create({
                    login: 'johndoe',
                    full_name: 'John Doe',
                    email: 'john.doe@example.com',
                    password: bcrypt.hashSync('password123', 7),
                    verified: true,
                    avatar: 'https://example.com/avatar/johndoe.jpg'
                }),
                userRepository.create({
                    login: 'janedoe',
                    full_name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    password: bcrypt.hashSync('password456', 7),
                    verified: true,
                    avatar: 'https://example.com/avatar/janedoe.jpg'
                }),
                userRepository.create({
                    login: 'bobsmith',
                    full_name: 'Bob Smith',
                    email: 'bob.smith@example.com',
                    password: bcrypt.hashSync('password789', 7),
                    verified: false
                })
            ];
            await userRepository.save(users);
            const calendars = [
                calendarRepository.create({
                    title: 'John\'s Personal Calendar',
                    description: 'Primary calendar for John Doe',
                    owner: users[0]
                }),
                calendarRepository.create({
                    title: 'Jane\'s Work Calendar',
                    description: 'Calendar for work-related events',
                    owner: users[1]
                })
            ];
            const savedCalendars = await calendarRepository.save(calendars);

            await dataSource
                .createQueryBuilder()
                .relation(User, 'sharedCalendars')
                .of(users[0])
                .add(savedCalendars[1]);
            
            await dataSource
                .createQueryBuilder()
                .relation(User, 'sharedCalendars')
                .of(users[1])
                .add(savedCalendars[0]);

            const tags = [
                tagRepository.create({
                    name: 'Work',
                    color: '#007bff',
                    description: 'Professional tasks and meetings',
                    calendar: savedCalendars[1]
                }),
                tagRepository.create({
                    name: 'Personal',
                    color: '#28a745',
                    description: 'Personal activities and appointments',
                    calendar: savedCalendars[0]
                }),
                tagRepository.create({
                    name: 'Urgent',
                    color: '#dc3545',
                    description: 'High priority tasks',
                    calendar: savedCalendars[0]
                })
            ];
            await tagRepository.save(tags);

            const events = [
                eventRepository.create({
                    title: 'Team Meeting',
                    description: 'Weekly team sync-up',
                    startTime: new Date('2024-03-27T10:00:00'),
                    endTime: new Date('2024-03-27T11:00:00'),
                    type: EventType.Arrangement,
                    recurrence: EventRecurrence.Weekly,
                    creator: users[1],
                    calendar: savedCalendars[1],
                    tags: [tags[0]]
                }),
                eventRepository.create({
                    title: 'Dentist Appointment',
                    description: 'Regular dental checkup',
                    startTime: new Date('2024-04-15T14:00:00'),
                    endTime: new Date('2024-04-15T15:00:00'),
                    type: EventType.Arrangement,
                    recurrence: EventRecurrence.None,
                    creator: users[0],
                    calendar: savedCalendars[0],
                    tags: [tags[1]]
                })
            ];
            await eventRepository.save(events);

            const notifications = [
                notificationRepository.create({
                    title: 'Team Meeting Reminder',
                    message: 'Your weekly team meeting starts in 1 hour',
                    type: NotificationType.EventReminder,
                    user: users[1],
                    relatedEvent: events[0],
                    isRead: false
                })
            ];
            await notificationRepository.save(notifications);

            await queryRunner.commitTransaction();
            console.log('Seeding completed successfully');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Seeding failed:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}


async function runSeed() {
    try {
        const dataSource = AppDataSource;

        await dataSource.initialize();
        
        await DatabaseSeeder.seed(dataSource);
        
        console.log('Seeding completed successfully');

        await dataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

runSeed();