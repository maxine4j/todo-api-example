import { startTodoApi } from './domain/todo/start-api';
import { createLifecycleManager } from './utils/lifecycle';
import { standardLogger } from './utils/logging';

const logger = standardLogger();
const lifecycle = createLifecycleManager();

process
  .on(`SIGTERM`, async () => {
    logger.info(`SIGTERM received`);
    await lifecycle.cleanup();
  })
  .on(`unhandledRejection`, async reason => {
    logger.error({ message: `Unhandled promise rejection`, reason });
    await lifecycle.cleanup();
    process.exitCode = 1;
  })
  .on(`uncaughtException`, async error => {
    logger.error({ message: `Unhandled exception`, error });
    await lifecycle.cleanup();
    process.exitCode = 1;
  });

(async () => {
  startTodoApi(logger, lifecycle);
})().catch(async error => {
  logger.error({ message: `Unhandled exception`, error });
  await lifecycle.cleanup();
  process.exitCode = 1;
});
