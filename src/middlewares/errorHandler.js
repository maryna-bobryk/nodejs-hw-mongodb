import { isHttpError } from 'http-errors';
import { MongooseError } from 'mongoose';

export const errorHandler = (err, req, res, next) => {
  if (isHttpError(err)) {
    // return res.status(err.status).json({
    //   status: err.status,
    //   message: err.message,
    //   data: err.errors || err.message,
    // });
    const response = {
      status: err.status,
      message: err.message,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.status).json(response);
  }

  if (err instanceof MongooseError) {
    return res.status(500).json({
      status: 500,
      message: 'Something went wrong with MongoDB',
      data: err.message,
    });
  }

  return res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};
