import { Prisma } from '@prisma/client';
import { TGenericErrorResponse } from '../interface';

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = 'Database error';
  let errorSources = [{ path: '', message: 'Database error' }];

  if (err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) ?? [];
    message = `Duplicate value for: ${fields.join(', ')}`;
    errorSources = fields.map((field) => ({
      path: field,
      message: `${field} already exists`,
    }));
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    errorSources = [{ path: '', message: 'Record not found' }];
  } else if (err.code === 'P2003') {
    message = 'Related record not found';
    errorSources = [{ path: '', message: 'Foreign key constraint failed' }];
  } else if (err.code === 'P2014') {
    message = 'Invalid relation';
    errorSources = [{ path: '', message: err.message }];
  }

  return { statusCode, message, errorSources };
};

export default handlePrismaError;
