import createError from 'http-errors';

export const notFoundHandler = (req, res, next) => {
  throw createError(404, 'Route not found');
};
