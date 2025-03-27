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

});

export const updateCalendarDto = Joi.object({
  title: Joi.string().min(3).max(100).messages({
    'string.min': 'Title must be at least 3 characters long.',
    'string.max': 'Title must be at most 100 characters long.'
  }),

  description: Joi.string().max(500).allow(null, '').messages({
    'string.max': 'Description must be at most 500 characters long.'
  }),


}).min(1);
