import { DomainError } from '../../utils/errors';
import { TodoRepository } from './repository';

export interface TodoUpdateCommand {
  todoId: string
  name: string
  done: boolean
}

export interface TodoUpdateCommandHandler {
  (command: TodoUpdateCommand): Promise<void>
}

export const todoUpdateCommandHandler = (
  repository: TodoRepository,
): TodoUpdateCommandHandler =>
  async ({ todoId, name, done }) => {
    const state = await repository.load(todoId);
    if (!state) throw new DomainError(`Todo does not exist`);
    await repository.save(todoId, { ...state, name, done });
  };
