import * as Joi from 'joi';
import { BadRequestError } from '../utils/http-errors';

export type SearchType = 'user' | 'event' | 'calendar' | 'tag' | 'notification';

export interface Filters {
  dateRange?: string;
  userId?: number;
  calendar_id?: number;
  eventId?: number;
  tagId?: number;
  creatorId?: number;
  notificationId?: number;
}

export interface QueryOptions {
  page: number;
  limit: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  filters?: Filters;
  search?: string;
  searchType?: SearchType;
}

export const queryOptionsDto = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(0).max(100).default(10),
  sortField: Joi.string().valid('createdAt', 'updatedAt', 'login').optional(),
  sortDirection: Joi.string().uppercase().valid('ASC', 'DESC').default('ASC'),
  filters: Joi.object({
    dateRange: Joi.string().pattern(/^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/).optional(),
    userId: Joi.number().integer().min(1).optional(),
    calendar_id: Joi.number().integer().min(1).optional(),
    eventId: Joi.number().integer().min(1).optional(),
    creatorId: Joi.number().integer().min(1).optional(),
    tagId: Joi.number().integer().min(1).optional(),
    notificationId: Joi.number().integer().min(1).optional(),
  }).optional(),
  search: Joi.string().min(1).optional(),
  searchType: Joi.string().valid('user', 'event', 'calendar').optional(),
});

export function validateQueryDto(value: any): QueryOptions {
  const { error, value: queryOptions } = queryOptionsDto.validate(value, {
    abortEarly: false,
  });
  if (error) {
    throw new BadRequestError(
      error.details.map((detail) => detail.message).join('; '),
    );
  }
  return queryOptions;
}
