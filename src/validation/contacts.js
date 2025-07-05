import Joi from 'joi';

export const createContactsSchema = Joi.object({
  name: Joi.string().alphanum().min(2).max(20).required().messages({
    'string.base': 'Name must be a string',
    'string.alphanum': 'Name must contain only letters and numbers',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name must be at most {#limit} characters long',
    'any.required': 'Name is required',
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9+()\s-]{7,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phonenumber is not a valid format',
      'any.required': 'Phonenumber is required',
      'string.base': 'Phonenumber " must be a string',
    }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.base': 'Email must be a string',
    }),

  isFavourite: Joi.boolean().default(false),

  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'any.only': 'Contact Type must be one of: work, home, personal',
      'any.required': 'Contact Type is required',
      'string.base': 'Contact Type must be a string',
    }),
});

export const updateContactsSchema = Joi.object({
  name: Joi.string().alphanum().min(2).max(20).messages({
    'string.base': 'Name must be a string',
    'string.alphanum': 'Name must contain only letters and numbers',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name must be at most {#limit} characters long',
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9+()\s-]{7,20}$/)
    .messages({
      'string.pattern.base': 'Phonenumber is not a valid format',
      'string.base': 'Phonenumber " must be a string',
    }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.base': 'Email must be a string',
    }),

  isFavourite: Joi.boolean().default(false),

  contactType: Joi.string().valid('work', 'home', 'personal').messages({
    'any.only': 'Contact Type must be one of: work, home, personal',
    'string.base': 'Contact Type must be a string',
  }),
});
