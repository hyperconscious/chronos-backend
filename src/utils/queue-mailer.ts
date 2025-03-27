import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { EventService } from '../services/event.service';
import config from '../config/env.config';
import { EventRecurrence } from '../entities/event.entity';
import { CalendarService } from '../services/calendar.service';

const eventService = new EventService();
const calendarService = new CalendarService();

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: 465,
    secure: true,
    auth: {
        user: config.mail.user,
        pass: config.mail.pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

async function sendEmail(to: string, subject: string, message: string) {
    await transporter.sendMail({
        from: '"Chronos"',
        to,
        subject,
        text: message,
    });
}


export function startCron()
{
    console.log('Starting mailer cron job');
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const startingEvents = await eventService.getEventsStartingAt(now);
        for (const event of startingEvents) {
            const owner = await calendarService.getCalendarOwner(event.calendar.id);
            try {
                await sendEmail(owner.user.email, `Event started: ${event.title}`, `Event "${event.title}" Starts right now. \n ${event.description}`);
                console.log(await eventService.markEventAsNotified(event));
            } catch (error) {
                console.log(error);
            }
        }
        const endingEvents = await eventService.getEventsEndingAt(now);
        for (const event of endingEvents) {
            const owner = await calendarService.getCalendarOwner(event.calendar.id);
            if (event.recurrence === EventRecurrence.None)
            {
                await sendEmail(owner.user.email, `Event ended: ${event.title}`, `Event "${event.title}" Ends right now.`);
                await eventService.markEventAsCompleted(event);
            } else {
                const newStart = getNextOccurrence(event.startTime, event.recurrence);
                if(event.endTime !== undefined){
                    const newEnd = getNextOccurrence(event.endTime, event.recurrence);
                    await eventService.updateEventTimeRange(event, newStart, newEnd);
                }
                await sendEmail(owner.user.email, `Event ended: ${event.title}`, `Event "${event.title}" again ${event.recurrence}.`);
            }
        }
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
