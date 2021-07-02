import { errorLogger as expressErrorLogger, logger as expressLogger } from 'express-winston';
import { createLogger, format, Logger, transports } from 'winston';

export const standardLogger = () => createLogger({
  format: format.combine(
    format(info => {
      if (info.error instanceof Error) info.error = { stack: info.error.stack, ...info.error };
      if (info instanceof Error) return { stack: info.stack, ...info };
      return info;
    })(),
    format.json(),
  ),
  transports: [new transports.Console()],
});

export const requestLogger = (logger: Logger) => expressLogger({
  winstonInstance: logger,
  requestWhitelist: [`method`, `headers`],
  responseWhitelist: [`statusCode`],
  msg: request => `HTTP ${request.method} ${request.path}`,
  ignoreRoute: request => [`/status`, `/health` ].includes(request.path),
});

export const errorLogger = (instance: Logger) =>
  expressErrorLogger({ winstonInstance: instance });
