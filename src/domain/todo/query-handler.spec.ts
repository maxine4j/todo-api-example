import { TodoQueryHandler, todoQueryHandler } from './query-handler';
import { inMemoryTodoRepository, TodoRepository } from './repository';
import { TodoItem } from './types';

describe(`todo query handler`, () => {
  const todoId = `todo-123`;
  const todo: TodoItem = { todoId, name: `Todo 123`, done: false };

  let repository: TodoRepository;
  let query: TodoQueryHandler;

  beforeEach(() => {
    repository = inMemoryTodoRepository();
    query = todoQueryHandler(repository);
  });

  test(`given no state > when query > should return undefined`, async () => {
    await expect(query(todoId)).resolves.toBeUndefined();
  });

  test(`given state > when query > should return state`, async () => {
    await repository.save(todoId, todo);
    await expect(query(todoId)).resolves.toEqual(todo);
  });
});
