import { TodoRepository } from './repository';
import { TodoItem } from './types';

export interface TodoCreateCommand {
  name: string
}

export interface TodoCreateCommandHandler {
  (command: TodoCreateCommand): Promise<string>
}

export const todoCreateCommandHandler = (
  repository: TodoRepository,
  uuid: () => string,
): TodoCreateCommandHandler =>
  async ({ name }) => {
    const todoId = uuid();
    const todo: TodoItem = { todoId, name, done: false };
    await repository.save(todoId, todo);
    return todoId;
  };
