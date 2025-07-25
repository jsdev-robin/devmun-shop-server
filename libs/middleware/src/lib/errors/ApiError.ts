import { Status } from '@server/utils';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly status: string;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4')
      ? Status.FAIL
      : Status.ERROR;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
