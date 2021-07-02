import { TodoRepository } from './repository';

export interface TodoDeleteCommand {
  todoId: string
}

export interface TodoDeleteCommandHandler {
  (command: TodoDeleteCommand): Promise<void>
}

export const todoDeleteCommandHandler = (
  repository: TodoRepository,
): TodoDeleteCommandHandler =>
  async ({ todoId }) => {
    await repository.delete(todoId);
  };
