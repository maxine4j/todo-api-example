import express from 'express';
import supertest from 'supertest';
import { DomainError } from '../../utils/errors';
import { errorHandler } from '../../utils/express';
import { todoRouter } from './router';
import { TodoItem } from './types';

describe(`todo router`, () => {

  const queryTodo = jest.fn();
  const createTodo = jest.fn();
  const updateTodo = jest.fn();
  const deleteTodo = jest.fn();

  const server = express()
    .use(todoRouter(queryTodo, createTodo, updateTodo, deleteTodo))
    .use(errorHandler)
    .listen(9001);

  beforeEach(() => {
    queryTodo.mockReset();
    createTodo.mockReset();
    updateTodo.mockReset();
    deleteTodo.mockReset();
  });

  afterAll(() => server.close());

  describe(`get todo`, () => {
    test(`given todo item does not exist > when get > should 404`, async () => {
      queryTodo.mockResolvedValue(undefined);
      await supertest(server)
        .get(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send()
        .expect(404)
        .then(() => {
          expect(queryTodo).toHaveBeenCalledWith(`todo-123`);
        });
    });

    test(`given todo item exists > when get > should return 200 and todo item`, async () => {
      const todo: TodoItem = { todoId: `todo-123`, name: `Todo 123`, done: true };
      queryTodo.mockResolvedValue(todo);
      await supertest(server)
        .get(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send()
        .expect(200)
        .then(response => {
          expect(queryTodo).toHaveBeenCalledWith(`todo-123`);
          expect(response.body).toEqual(todo);
        });
    });
  });

  describe(`create todo`, () => {
    test(`given invalid request > when post > should return 400 with validation errors`, async () => {
      await supertest(server)
        .post(`/`)
        .set(`Accept`, `application/json`)
        .send({ asd: 123 })
        .expect(400)
        .then(response => {
          expect(createTodo).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: `Invalid Request`,
            errors: [`Name must be a valid string`],
          });
        });
    });

    test(`given valid request > when post > should return 201 with todo id`, async () => {
      createTodo.mockResolvedValue(`todo-123`);
      await supertest(server)
        .post(`/`)
        .set(`Accept`, `application/json`)
        .send({ name: `My Todo` })
        .expect(201)
        .then(response => {
          expect(createTodo).toHaveBeenCalledWith({ name: `My Todo` });
          expect(response.body).toEqual({ todoId: `todo-123` });
        });
    });
  });

  describe(`update todo`, () => {
    test(`given invalid request > when put > should return 400 with validation errors`, async () => {
      await supertest(server)
        .put(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send({ asd: 123 })
        .expect(400)
        .then(response => {
          expect(createTodo).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: `Invalid Request`,
            errors: [
              `Name must be a valid string`,
              `Done must be a valid boolean`,
            ],
          });
        });
    });

    test(`given valid request but todo does not exist > when put > should return 404`, async () => {
      updateTodo.mockRejectedValue(new DomainError(`Todo does not exist`));
      await supertest(server)
        .put(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send({ name: `My Todo`, done: true })
        .expect(404)
        .then(() => {
          expect(updateTodo).toHaveBeenCalledWith({ todoId: `todo-123`, name: `My Todo`, done: true });
        });
    });

    test(`given valid request > when put > should return 200`, async () => {
      await supertest(server)
        .put(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send({ name: `My Todo`, done: true })
        .expect(200)
        .then(() => {
          expect(updateTodo).toHaveBeenCalledWith({ todoId: `todo-123`, name: `My Todo`, done: true });
        });
    });
  });

  describe(`delete todo`, () => {
    test(`given todo does not exist > when delete > should return 404`, async () => {
      queryTodo.mockResolvedValue(undefined);
      await supertest(server)
        .delete(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send()
        .expect(404)
        .then(() => {
          expect(queryTodo).toHaveBeenCalledWith(`todo-123`);
          expect(deleteTodo).not.toHaveBeenCalled();
        });
    });

    test(`given todo does exist > when delete > should return 200`, async () => {
      queryTodo.mockResolvedValue({ todoId: `todo-123`, name: `Todo 123`, done: true });
      await supertest(server)
        .delete(`/todo-123`)
        .set(`Accept`, `application/json`)
        .send()
        .expect(200)
        .then(() => {
          expect(queryTodo).toHaveBeenCalledWith(`todo-123`);
          expect(deleteTodo).toHaveBeenCalledWith({ todoId: `todo-123` });
        });
    });
  });
});
