import Joi from 'joi';
import { NotificationType } from '../entities/notification.entity';

export const createNotificationDto = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.',
    'any.required': 'Title is required.'
  }),

  message: Joi.string().min(5).max(1000).required().messages({
    'string.min': 'Message must be at least 5 characters long.',
    'string.max': 'Message must be at most 1000 characters long.',
    'any.required': 'Message is required.'
  }),

  type: Joi.string()
    .valid(...Object.values(NotificationType))
    .optional()
    .messages({
      'any.only': `Type must be one of: ${Object.values(NotificationType).join(', ')}.`,
      'any.required': 'Type is required.'
    }),

  isRead: Joi.boolean().default(false),

  user: Joi.object(),

  relatedEvent: Joi.object().optional(),
});

export const updateNotificationDto = Joi.object({
  title: Joi.string().min(3).max(100).messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.'
  }),

  message: Joi.string().min(5).max(1000).messages({
    'string.min': 'Message must be at least 5 characters long.',
    'string.max': 'Message must be at most 1000 characters long.'
  }),

  type: Joi.string()
    .valid(...Object.values(NotificationType))
    .messages({
      'any.only': `Type must be one of: ${Object.values(NotificationType).join(', ')}.`
    }),

  isRead: Joi.boolean(),

  user: Joi.object(),
  relatedEvent: Joi.object().optional(),
}).min(1);
