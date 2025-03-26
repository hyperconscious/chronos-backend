import Joi from 'joi';

export const createTagDto = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name must be at most 50 characters long.',
    'any.required': 'Name is required.'
  }),

  color: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .default('#6c757d')
    .messages({
      'string.pattern.base': 'Color must be a valid hex code (e.g., #RRGGBB or #RGB).'
    }),

  description: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'Description must be at most 255 characters long.'
  })
});

export const updateTagDto = Joi.object({
  name: Joi.string().min(2).max(50).messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name must be at most 50 characters long.'
  }),

  color: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .messages({
      'string.pattern.base': 'Color must be a valid hex code (e.g., #RRGGBB or #RGB).'
    }),

  description: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'Description must be at most 255 characters long.'
  })
}).min(1);
