/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import config from '../config';
import { TErrorSources } from '../interface';
import handleZodError from '../error/handleZodError';
import handlePrismaError from '../error/handlePrismaError';
import AppError from '../error/appError';

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Global Error Handler:', err);

  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [{ path: '', message: 'Something went wrong' }];

  if (err instanceof ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorSources = simplified.errorSources;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplified = handlePrismaError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorSources = simplified.errorSources;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    errorSources = [{ path: '', message: err.message.split('\n').pop() ?? err.message }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: '', message: err.message }];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
