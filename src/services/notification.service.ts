import { Repository } from 'typeorm';
import { BadRequestError, NotFoundError } from '../utils/http-errors';
import { Notification } from '../entities/notification.entity';
import { AppDataSource } from '../config/orm.config';
import { createNotificationDto, updateNotificationDto } from '../dto/notification.dto';
import { Paginator, QueryOptions } from '../utils/paginator';

export const enum ServiceMethod {
  create,
  update,
}

export class NotificationService {
  private notificationRepository: Repository<Notification>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
  }

  private validateNotificationDTO(notificationData: Partial<Notification>, method: ServiceMethod) {
    const dto = method === ServiceMethod.create ? createNotificationDto : updateNotificationDto;
    const { error } = dto.validate(notificationData, { abortEarly: false });

    if (error) {
      throw new BadRequestError(
        error.details.map((detail) => detail.message).join('; '),
      );
    }
  }

  public async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    this.validateNotificationDTO(notificationData, ServiceMethod.create);

    const newNotification = this.notificationRepository.create(notificationData);

    return this.notificationRepository.save(newNotification);
  }

  public async updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification> {
    this.validateNotificationDTO(notificationData, ServiceMethod.update);

    const notification = await this.getNotificationById(id);

    const updatedNotification = this.notificationRepository.merge(notification, notificationData);

    return this.notificationRepository.save(updatedNotification);
  }

  public async getNotificationById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({ id });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  }

  public async getNotifications(
    queryOptions: QueryOptions,
  ): Promise<{ items: Notification[]; total: number }> {
    queryOptions.searchType = 'notification';
    queryOptions.sortField = queryOptions.sortField || 'createdAt'; // Default to sorting by createdAt
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
    const paginator = new Paginator<Notification>(queryOptions);
    return await paginator.paginate(queryBuilder);
  }

  public async markAsRead(id: number): Promise<Notification> {
    const notification = await this.getNotificationById(id);

    notification.isRead = true;

    return this.notificationRepository.save(notification);
  }

  public async deleteNotification(id: number): Promise<boolean> {
    try {
      const notification = await this.getNotificationById(id);
      await this.notificationRepository.remove(notification);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Unable to delete notification due to existing dependencies.');
    }
  }
}
