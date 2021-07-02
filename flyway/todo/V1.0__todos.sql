CREATE TABLE todo_api.todos (
  todo_id TEXT CONSTRAINT pk PRIMARY KEY,
  name TEXT NOT NULL,
  done BOOLEAN NOT NULL
);
