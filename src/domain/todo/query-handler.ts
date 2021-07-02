import { TodoRepository } from './repository';
import { TodoItem } from './types';

export interface TodoQueryHandler {
  (todoId: string): Promise<TodoItem | undefined>
}

export const todoQueryHandler = (
  repository: TodoRepository,
): TodoQueryHandler =>
  todoId => repository.load(todoId);
