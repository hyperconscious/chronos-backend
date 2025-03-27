import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { EventService } from '../services/event.service';
import config from '../config/env.config';
import { EventRecurrence } from '../entities/event.entity';
import { CalendarService } from '../services/calendar.service';
import { MailService } from '../services/mail.service';
import { NotificationService } from '../services/notification.service';

const eventService = new EventService();
const calendarService = new CalendarService();
const notificationService = new NotificationService();

async function scheduleMailSending() {
    const now = new Date();
    const startingEvents = await eventService.getEventsStartingAt(now);
    for (const event of startingEvents) {
        try {
            const owner = await calendarService.getCalendarOwner(event.calendar.id);
            await notificationService.createNotification({
                title: `Event started: ${event.title}`,
                message: `Event "${event.title}" starts right now. \n ${event.description}`,
                user: owner.user,
                relatedEvent: event,
            }, true);
            await eventService.markEventAsNotified(event);
        } catch (error) {
            console.log(error);
        }
    }
    const endingEvents = await eventService.getEventsEndingAt(now);
    for (const event of endingEvents) {
        try
        {
            const owner = await calendarService.getCalendarOwner(event.calendar.id);
            if (event.recurrence == EventRecurrence.None)
            {
                console.log('Event has no recurrence');
                await notificationService.createNotification({
                    title: `Event ended: ${event.title}`,
                    message: `Event "${event.title}" Ends right now.`,
                    user: owner.user,
                    relatedEvent: event,
                }, true);
                await eventService.markEventAsCompleted(event);
            } else {
                const newStart = getNextOccurrence(event.startTime, event.recurrence);
                if(event.endTime !== undefined){
                    const newEnd = getNextOccurrence(event.endTime, event.recurrence);
                    await eventService.updateEventTimeRange(event, newStart, newEnd);
                }
                await notificationService.createNotification({
                    title: `Event ended: ${event.title}`,
                    message: `Event "${event.title}" you see this event again in ${event.recurrence}.`,
                    user: owner.user,
                    relatedEvent: event,
                }, true);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export function startCron()
{
    console.log('Starting mailer cron job');
    cron.schedule('* * * * *', async () => {
        await scheduleMailSending();
    });

}

function getNextOccurrence(date: Date, schedule: EventRecurrence): Date {
    const newDate = new Date(date);
    switch (schedule) {
        case EventRecurrence.Daily:
            newDate.setDate(newDate.getDate() + 1);
            break;
        case EventRecurrence.Weekly:
            newDate.setDate(newDate.getDate() + 7);
            break;
        case EventRecurrence.Monthly:
            newDate.setMonth(newDate.getMonth() + 1);
            break;
        case EventRecurrence.Yearly:
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
    }
    return newDate;
}
