import { Request, Response, Router } from 'express';
import { Pool } from 'pg';
import { Logger } from 'winston';
import { asyncRoute } from './express';

export const health = (
  pool: Pool,
  logger: Logger,
) => {

  const checkDatabaseStatus = async () => {
    const startTime = process.hrtime();
    const { rows } = await pool.query(`SELECT 1`);
    const [seconds, nanoseconds] = process.hrtime(startTime);

    if (!rows) return { service: `database`, error: `Database query failed` };
    return { service: `database`, responseTime: (seconds * 1e3) + (nanoseconds / 1e6) };
  };

  const getHealthRoute = async (request: Request, response: Response) =>
    response.status(200).send();

  const getStatusRoute = async (request: Request, response: Response) => {
    const status = await checkDatabaseStatus();
    if (status.error !== undefined) logger.error(`Status check failed ${status.error}`);
    const responseCode = status.error !== undefined ? 500 : 200;
    return response.status(responseCode).json(status);
  };

  return Router()
    .get(`/health`, asyncRoute(getHealthRoute))
    .get(`/status`, asyncRoute(getStatusRoute));
};
