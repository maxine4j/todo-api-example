import { getTestDbConnection } from '../../utils/database';
import { inMemoryTodoRepository, postgresqlTodoRepository, TodoRepository } from './repository';
import { TodoItem } from './types';

const testBase = (
  getRepository: () => Promise<TodoRepository>,
) => () => {

  const todoId = `todo-123`;
  const todo: TodoItem = { todoId, name: `Todo 123`, done: false };

  let repository: TodoRepository;

  beforeEach(async () => {
    repository = await getRepository();
  });

  test(`given no state > when load > should return undefined`, async () => {
    await expect(repository.load(`todo-123`)).resolves.toBeUndefined();
  });

  test(`given no state > when save then load > should return saved state`, async () => {
    await repository.save(todoId, todo);
    await expect(repository.load(todoId)).resolves.toEqual(todo);
  });

  test(`given saved state > when save then load > should return updated state`, async () => {
    await repository.save(todoId, todo);
    await expect(repository.load(todoId)).resolves.toEqual(todo);

    await repository.save(todoId, { todoId, name: `New Name`, done: true });
    await expect(repository.load(todoId)).resolves.toEqual({ todoId, name: `New Name`, done: true });
  });

  test(`given no state > when delete > should do nothing `, async () => {
    await expect(repository.delete(todoId)).resolves.toBeUndefined();
  });

  test(`given saved state > when delete > should delete saved state`, async () => {
    await repository.save(todoId, todo);
    await expect(repository.load(todoId)).resolves.toEqual(todo);

    await repository.delete(todoId);
    await expect(repository.load(todoId)).resolves.toBeUndefined();
  });
};

describe(`todo repository`, () => {

  const pool = getTestDbConnection();

  afterAll(() => pool.end());

  describe(`in memory`, testBase(async () => inMemoryTodoRepository()));

  describe(`postgres`, testBase(async () => {
    await pool.query(`DELETE FROM todo_api.todos`);
    return postgresqlTodoRepository(pool);
  }));
});
