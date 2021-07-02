import { todoDeleteCommandHandler, TodoDeleteCommandHandler } from './delete-handler';
import { inMemoryTodoRepository, TodoRepository } from './repository';
import { TodoItem } from './types';

describe(`todo delete command handler`, () => {
  const todoId = `todo-123`;
  const todo: TodoItem = { todoId, name: `Todo 123`, done: false };

  let repository: TodoRepository;
  let handle: TodoDeleteCommandHandler;

  beforeEach(() => {
    repository = inMemoryTodoRepository();
    handle = todoDeleteCommandHandler(repository);
  });

  test(`given no state > when handle > should do nothing`, async () => {
    await expect(handle({ todoId })).resolves.toBeUndefined();
  });

  test(`given state > when handle > should delete state`, async () => {
    await repository.save(todoId, todo);
    await handle({ todoId });
    await expect(repository.load(todoId)).resolves.toBeUndefined();
  });
});
