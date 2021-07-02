import { todoCreateCommandHandler, TodoCreateCommandHandler } from './create-handler';
import { inMemoryTodoRepository, TodoRepository } from './repository';

describe(`todo create command handler`, () => {
  const todoId = `todo-123`;

  let repository: TodoRepository;
  let handle: TodoCreateCommandHandler;

  beforeEach(() => {
    repository = inMemoryTodoRepository();
    handle = todoCreateCommandHandler(repository, () => todoId);
  });

  test(`given command > when handle > should save new todo with expected state and return id`, async () => {
    await expect(handle({ name: `Todo 123` })).resolves.toBe(todoId);
    await expect(repository.load(todoId)).resolves.toEqual({ todoId, name: `Todo 123`, done: false });
  });
});
