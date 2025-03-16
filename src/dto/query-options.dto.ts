import * as Joi from 'joi';

export type SearchType = 'user';


export interface Filters {
  dateRange?: string;
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
  sortField: Joi.string().optional(),
  sortDirection: Joi.string().uppercase().valid('ASC', 'DESC').default('ASC'),
  filters: Joi.object({
    categories: Joi.string().optional(),
    dateRange: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive', 'locked').optional(),
    categoryId: Joi.number().integer().min(1).optional(),
    postAuthor: Joi.object({
      id: Joi.number().integer().min(1).required(),
    }).optional(),
  }).optional(),
  search: Joi.string().min(1).optional(),
});
