import { DomainError } from '../../utils/errors';
import { inMemoryTodoRepository, TodoRepository } from './repository';
import { TodoUpdateCommandHandler, todoUpdateCommandHandler } from './update-handler';

describe(`todo update command handler`, () => {
  const todoId = `todo-123`;

  let repository: TodoRepository;
  let handle: TodoUpdateCommandHandler;

  beforeEach(() => {
    repository = inMemoryTodoRepository();
    handle = todoUpdateCommandHandler(repository);
  });

  test(`given no state > when handle > should do noting`, async () => {
    await expect(handle({ todoId, name: `Todo 234`, done: true })).rejects.toThrowError(new DomainError(`Todo does not exist`));
  });

  test(`given state > when handle > should update state`, async () => {
    await repository.save(todoId, { todoId, name: `Todo 123`, done: false });
    await handle({ todoId, name: `Todo 234`, done: true });
    await expect(repository.load(todoId)).resolves.toEqual({ todoId, name: `Todo 234`, done: true });
  });
});
