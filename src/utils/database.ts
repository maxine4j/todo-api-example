import { Pool } from 'pg';
import { createLogger, Logger } from 'winston';

interface DatabaseConfig {
  host: string
  name: string
  user: string
  password: string
  port: string
}

export const getDbConnection = (
  config: DatabaseConfig,
  logger: Logger,
) =>
  new Pool({
    connectionTimeoutMillis: 30000,
    max: 20,
    host: config.host,
    database: config.name,
    user: config.user,
    password: config.password,
    port: Number(config.port),
  }).on(`error`, (error: Error) => logger.error(`Database error`, error.message));

export const getTestDbConnection = () =>
  getDbConnection({ host: `localhost`, name: `postgres`, user: `postgres`, password: `postgres`, port: `5432` }, createLogger({ silent: true }));
