import cookieParser from 'cookie-parser';
import express from 'express';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { getDbConnection } from '../../utils/database';
import { errorHandler, notFoundHandler } from '../../utils/express';
import { health as healthRouter } from '../../utils/health';
import { LifecycleManager } from '../../utils/lifecycle';
import { errorLogger, requestLogger } from '../../utils/logging';
import { todoCreateCommandHandler } from './create-handler';
import { todoDeleteCommandHandler } from './delete-handler';
import { todoQueryHandler } from './query-handler';
import { postgresqlTodoRepository } from './repository';
import { todoRouter } from './router';
import { todoUpdateCommandHandler } from './update-handler';

const env = {
  port: process.env.PORT as string,
  databaseConfig: {
    host: process.env.DB_HOST as string,
    port: process.env.DB_PORT as string,
    name: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
  },
};

export const startTodoApi = (logger: Logger, lifecycle: LifecycleManager) => {
  const databasePool = getDbConnection(env.databaseConfig, logger);

  const repository = postgresqlTodoRepository(databasePool);
  const queryTodo = todoQueryHandler(repository);
  const createTodo = todoCreateCommandHandler(repository, () => uuid());
  const updateTodo = todoUpdateCommandHandler(repository);
  const deleteTodo = todoDeleteCommandHandler(repository);

  const api = express()
    .use(requestLogger(logger))
    .use(healthRouter(databasePool, logger))
    .use(cookieParser())
    .use(`/todo`, todoRouter(queryTodo, createTodo, updateTodo, deleteTodo))
    .use(notFoundHandler)
    .use(errorLogger(logger))
    .use(errorHandler)
    .listen(env.port, () => logger.info(`Listening on port: ${env.port}`));

  lifecycle.registerCleanupCallback(async () => {
    api.close(() => Promise.all([
      databasePool.end(),
    ]));
  });
};
