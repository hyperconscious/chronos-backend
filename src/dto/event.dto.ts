import Joi from "joi";


export const createEventDto = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.',
    'any.required': 'Title is required.'
  }),

  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Description must be at most 500 characters long.'
  }),

  startTime: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date.',
  }),

  endTime: Joi.date().optional().messages({
    'date.base': 'End date must be a valid date.',
  }),

  type: Joi.string().valid('arrangement', 'reminder', 'task').messages({
    'any.only': 'Type must be one of: arrangement, reminder, task.'
  }),

  creator: Joi.number().integer().positive().optional().messages({
    'number.base': 'Creator ID must be a number.',
    'number.integer': 'Creator ID must be an integer.',
    'number.positive': 'Creator ID must be a positive number.',
  }),

  recurrence: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly').optional().messages({
    'any.only': 'Reccurence must be one of: none, daily, weekly, monthly, yearly.'
  }),

  color: Joi.string().messages({
    'string.hex': 'Color must be a valid hex color code.',
  }),
});

export const updateEventDto = Joi.object({
  title: Joi.string().min(3).max(100).messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.'
  }),

  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Description must be at most 500 characters long.'
  }),

  // status: Joi.string().valid('pending', 'in_progress', 'completed').messages({
  //   'any.only': 'Status must be one of: pending, in_progress, completed.'
  // }),

  startTime: Joi.date().messages({
    'date.base': 'Start date must be a valid date.',
  }),

  endTime: Joi.date().greater(Joi.ref('startTime')).messages({
    'date.base': 'End date must be a valid date.',
    'date.greater': 'End date must be greater than startTime.'
  }),

  type: Joi.string().valid('arrangement', 'reminder', 'task').messages({
    'any.only': 'Type must be one of: arrangement, reminder, task.'
  }),

  recurrence: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly').messages({
    'any.only': 'Reccurence must be one of: none, daily, weekly, monthly, yearly.'
  }),

  color: Joi.string().messages({
    'string.hex': 'Color must be a valid hex color code.',
  }),

}).min(1);
