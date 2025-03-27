import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/http-errors';
import { StatusCodes } from 'http-status-codes';
import { createNotificationDto, updateNotificationDto } from '../dto/notification.dto';
import { Paginator, QueryOptions } from '../utils/paginator';
import { validateQueryDto } from '../dto/query-options.dto';

export class NotificationController {
    private static notificationService = new NotificationService();

    public static async getNotifications(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const queryOptions = validateQueryDto(req);
        queryOptions.filters = { userId: req.user.id };

        const { items, total } = await NotificationController.notificationService.getNotifications(queryOptions);
        return res.status(StatusCodes.OK).json({ items, total });
    }

    public static async getNotificationById(req: Request, res: Response) {
        const notificationId = parseInt(req.params.id, 10);
        if (!notificationId) {
            throw new BadRequestError('Notification ID is required');
        }

        const notification = await NotificationController.notificationService.getNotificationById(notificationId);

        if(notification.user.id !== req.user?.id) {
            throw new ForbiddenError('You are not allowed to access this notification.');
        }
        return res.status(StatusCodes.OK).json(notification);
    }

    public static async createNotification(req: Request, res: Response) {
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        let isMail = false;
        if (req.body.sendMail === 'true') {
            isMail = true;
        }

        const notificationDto = await createNotificationDto.validateAsync(req.body);

        const newNotification = await NotificationController.notificationService.createNotification(
            notificationDto,
            isMail
        );
        return res.status(StatusCodes.CREATED).json(newNotification);
    }

    public static async updateNotification(req: Request, res: Response) {
        const notificationId = parseInt(req.params.id, 10);
        if (!notificationId) {
            throw new BadRequestError('Notification ID is required');
        }

        const notificationDto = await updateNotificationDto.validateAsync(req.body);

        const updatedNotification = await NotificationController.notificationService.updateNotification(
            notificationId,
            notificationDto
        );

        return res.status(StatusCodes.OK).json(updatedNotification);
    }

    public static async markNotificationAsRead(req: Request, res: Response) {
        const notificationId = parseInt(req.params.id, 10);
        if (!notificationId) {
            throw new BadRequestError('Notification ID is required');
        }
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        if((await NotificationController.notificationService.getNotificationById(notificationId)).user.id !== req.user.id) {
            throw new ForbiddenError('You are not allowed to access this notification.');
        }
        const updatedNotification = await NotificationController.notificationService.markAsRead(notificationId);
        return res.status(StatusCodes.OK).json(updatedNotification);
    }

    public static async deleteNotification(req: Request, res: Response) {
        const notificationId = parseInt(req.params.id, 10);
        if (!notificationId) {
            throw new BadRequestError('Notification ID is required');
        }
        if (!req.user) {
            throw new UnauthorizedError('You need to be logged in.');
        }
        const notification = await NotificationController.notificationService.getNotificationById(notificationId);
        if(!notification) {
            throw new NotFoundError('Notification not found');
        }
        if(notification.user.id !== req.user.id) {
            throw new ForbiddenError('You are not allowed to delete this notification.');
        }
        await NotificationController.notificationService.deleteNotification(notificationId);
        return res.status(StatusCodes.NO_CONTENT).json();
    }
}
