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

    startTime: Joi.date().greater('now').optional().messages({
        'date.greater': 'Start date must be in the future.'
    }),

    endTime: Joi.date().greater('now').optional().messages({
        'date.greater': 'End date must be in the future.'
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
});

  export const updateEventDto = Joi.object({
    title: Joi.string().min(3).max(100).messages({
      'string.min': 'Title must be at least 3 characters long.',
      'string.max': 'Title must be at most 100 characters long.'
    }),
  
    description: Joi.string().max(500).allow('', null).messages({
      'string.max': 'Description must be at most 500 characters long.'
    }),
  
    status: Joi.string().valid('pending', 'in_progress', 'completed').messages({
      'any.only': 'Status must be one of: pending, in_progress, completed.'
    }),
  
    start_time: Joi.date().greater('now').messages({
        'date.greater': 'Start date must be in the future.'
    }),

    end_time: Joi.date().greater('now').messages({
        'date.greater': 'End date must be in the future.'
    }),

    type: Joi.string().valid('arrangement', 'reminder', 'task').messages({
        'any.only': 'Type must be one of: arrangement, reminder, task.'
    }),
  }).min(1);
  