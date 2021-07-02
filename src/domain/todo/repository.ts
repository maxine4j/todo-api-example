import { Pool } from 'pg';
import { TodoItem } from './types';

export interface TodoRepository {
  load: (todoId: string) => Promise<TodoItem | undefined>
  save: (todoId: string, todo: TodoItem) => Promise<void>
  delete: (todoId: string) => Promise<void>
}

export const inMemoryTodoRepository = (): TodoRepository => {
  const store = new Map<string, TodoItem>();

  return {
    load: async todoId => store.get(todoId),
    save: async (todoId, todo) => {
      store.set(todoId, todo);
    },
    delete: async todoId => {
      store.delete(todoId);
    },
  };
};

export const postgresqlTodoRepository = (
  pool: Pool,
): TodoRepository => ({
  load: async todoId => {
    const { rows } = await pool.query(`SELECT name, done FROM todo_api.todos WHERE todo_id = $1`, [todoId]);
    if (!rows?.[0]) return undefined;
    const { name, done } = rows[0];
    return { todoId, name, done };
  },
  save: async (todoId, { name, done }) => {
    await pool.query(
      `INSERT INTO todo_api.todos (todo_id, name, done)
      VALUES ($1, $2, $3)
      ON CONFLICT ON CONSTRAINT pk DO UPDATE
      SET name = $2, done = $3`,
      [todoId, name, done],
    );
  },
  delete: async todoId => {
    await pool.query(`DELETE FROM todo_api.todos WHERE todo_id = $1`, [todoId]);
  },
});
