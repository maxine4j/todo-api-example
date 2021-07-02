import { Request, Response, NextFunction, RequestHandler } from 'express';
import { DomainError, ValidationError } from './errors';

export const asyncRoute = (route: RequestHandler) =>
  async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
    // eslint-disable-next-line @typescript-eslint/await-thenable
      await route(request, response, next);
    } catch (error) {
      next(error);
    }
  };

export const notFoundHandler = (request: Request, response: Response): Response =>
  response.status(404).send({ error: `Not found` });

export const errorHandler = (error: Error, request: Request, response: Response, next: NextFunction): Response => {
  switch (true) {
    case error instanceof ValidationError: {
      const validationError = error as ValidationError;
      return response.status(400).send({ message: validationError.message, errors: validationError.errors });
    }
    case error instanceof DomainError: return response.status(400).send({ message: error.message });
    default: return response.status(500).send({ message: `An unhandled error occurred` });
  }
};
