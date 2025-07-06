import Joi from 'joi';

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Name must be at least {#limit} characters long',
  }),
});
