import Joi from 'joi';

export const createCalendarDto = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.',
    'any.required': 'Title is required.'
  }),

  description: Joi.string().max(500).allow(null, '').messages({
    'string.max': 'Description must be at most 500 characters long.'
  }),

  ownerId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Owner ID must be a number.',
    'number.integer': 'Owner ID must be an integer.',
    'number.positive': 'Owner ID must be a positive number.',
  }),

  events: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .messages({
      'array.unique': 'Event IDs must be unique.',
      'number.base': 'Event ID must be a number.',
      'number.integer': 'Event ID must be an integer.',
      'number.positive': 'Event ID must be a positive number.'
    })
});

export const updateCalendarDto = Joi.object({
  title: Joi.string().min(3).max(100).messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.'
  }),

  description: Joi.string().max(500).allow(null, '').messages({
    'string.max': 'Description must be at most 500 characters long.'
  }),

  ownerId: Joi.number().integer().positive().optional().messages({
    'number.base': 'Owner ID must be a number.',
    'number.integer': 'Owner ID must be an integer.',
    'number.positive': 'Owner ID must be a positive number.',
  }),

  events: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .messages({
      'array.unique': 'Event IDs must be unique.',
      'number.base': 'Event ID must be a number.',
      'number.integer': 'Event ID must be an integer.',
      'number.positive': 'Event ID must be a positive number.'
    })
}).min(1);
