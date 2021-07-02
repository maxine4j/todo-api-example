import { json, Router, Request, Response } from 'express';
import { DomainError, ValidationError } from '../../utils/errors';
import { asyncRoute } from '../../utils/express';
import { TodoCreateCommandHandler } from './create-handler';
import { TodoDeleteCommandHandler } from './delete-handler';
import { TodoQueryHandler } from './query-handler';
import { TodoUpdateCommandHandler } from './update-handler';

export const todoRouter = (
  queryTodo: TodoQueryHandler,
  createTodo: TodoCreateCommandHandler,
  updateTodo: TodoUpdateCommandHandler,
  deleteTodo: TodoDeleteCommandHandler,
) => {

  const isValidString = (value: unknown): value is string => typeof value === `string` && value.trim().length > 0;
  const isValidBoolean = (value: unknown): value is boolean => typeof value === `boolean`;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  function validateCreateTodoRoute(body: Record<string, unknown>): asserts body is { name: string } {
    const errors: string[] = [];
    if (!isValidString(body.name)) errors.push(`Name must be a valid string`);
    if (errors.length > 0) throw new ValidationError(errors);
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  function validateUpdateTodoRoute(body: Record<string, unknown>): asserts body is { name: string, done: boolean } {
    const errors: string[] = [];
    if (!isValidString(body.name)) errors.push(`Name must be a valid string`);
    if (!isValidBoolean(body.done)) errors.push(`Done must be a valid boolean`);
    if (errors.length > 0) throw new ValidationError(errors);
  }

  const getTodoRoute = async (request: Request, response: Response) => {
    const { todoId } = request.params;

    const todo = await queryTodo(todoId);
    if (todo === undefined) return response.sendStatus(404);

    return response.status(200).send(todo);
  };

  const createTodoRoute = async (request: Request, response: Response) => {
    validateCreateTodoRoute(request.body);
    const { name } = request.body;

    const todoId = await createTodo({ name });
    return response.status(201).send({ todoId });
  };

  const updateTodoRoute = async (request: Request, response: Response) => {
    const { todoId } = request.params;
    validateUpdateTodoRoute(request.body);
    const { name, done } = request.body;

    try {
      await updateTodo({ todoId, name, done });
    } catch (error) {
      if (error instanceof DomainError) return response.sendStatus(404);
      throw error;
    }

    return response.sendStatus(200);
  };

  const deleteTodoRoute = async (request: Request, response: Response) => {
    const { todoId } = request.params;

    const todo = await queryTodo(todoId);
    if (todo === undefined) return response.sendStatus(404);

    await deleteTodo({ todoId });
    return response.sendStatus(200);
  };

  return Router()
    .use(json())
    .get(`/:todoId`, asyncRoute(getTodoRoute))
    .post(`/`, asyncRoute(createTodoRoute))
    .put(`/:todoId`, asyncRoute(updateTodoRoute))
    .delete(`/:todoId`, asyncRoute(deleteTodoRoute));
};
