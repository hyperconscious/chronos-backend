import { Repository } from 'typeorm';
import { BadRequestError, NotFoundError } from '../utils/http-errors';
import { Notification } from '../entities/notification.entity';
import { AppDataSource } from '../config/orm.config';
import { createNotificationDto, updateNotificationDto } from '../dto/notification.dto';
import { Paginator, QueryOptions } from '../utils/paginator';
import { MailService } from './mail.service';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';

export const enum ServiceMethod {
  create,
  update,
}

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private mailService: MailService = new MailService();

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

  public async createNotification(
    notificationData: Partial<Notification>,
    sendMail: boolean = false
  ): Promise<Notification> {
    this.validateNotificationDTO(notificationData, ServiceMethod.create);

    const { user, relatedEvent, ...rest } = notificationData;

    if (!user || typeof user !== 'object' || !user.id) {
      throw new BadRequestError('User is required for notification.');
    }

    const userEntity = await AppDataSource.getRepository(User).findOne({
      where: { id: user.id },
      relations: ['notifications'],
    });

    if (!userEntity) {
      throw new NotFoundError('User not found');
    }

    let eventEntity: Event | undefined = undefined;
    if (relatedEvent && relatedEvent.id) {
      const event = await AppDataSource.getRepository(Event).findOne({
      where: { id: relatedEvent.id },});
      if (!event) {
        throw new NotFoundError('Related event not found');
      }
      eventEntity = event;
      if (!eventEntity) {
        throw new NotFoundError('Related event not found');
      }
    }

    const newNotification = this.notificationRepository.create({
      ...rest,
      user: userEntity,
      relatedEvent: eventEntity,
    });

    const savedNotification = await this.notificationRepository.save(newNotification);

    if (sendMail && userEntity.email) {
      try {
        await this.mailService.sendEmail(userEntity.email, savedNotification.title, savedNotification.message);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    return savedNotification;
  }

  public async updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification> {
    this.validateNotificationDTO(notificationData, ServiceMethod.update);

    const notification = await this.getNotificationById(id);

    const updatedNotification = this.notificationRepository.merge(notification, notificationData);

    return this.notificationRepository.save(updatedNotification);
  }

  public async getNotificationById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user', 'relatedEvent'],
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  }

  public async getNotifications(
    queryOptions: QueryOptions,
  ): Promise<{ items: Notification[]; total: number }> {
    queryOptions.searchType = 'notification';
    queryOptions.sortField = queryOptions.sortField || 'createdAt';
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoinAndSelect('notification.relatedEvent', 'event');

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
