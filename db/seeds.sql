-- user (password = 123456 hashed)
INSERT INTO users (id, name, email, password)
VALUES (
  uuid_generate_v4(),
  'Test User',
  'test@example.com',
  '$2b$12$KIXQ4rF0YhP3vFhZpVnH1e9zvK6h9VZQ8lqWfV1UQFzQk8U9ZlWqK'
);

-- project
INSERT INTO projects (id, name, owner_id)
VALUES (
  uuid_generate_v4(),
  'Sample Project',
  (SELECT id FROM users LIMIT 1)
);

-- tasks
INSERT INTO tasks (title, status, project_id)
SELECT 'Task 1', 'todo', id FROM projects LIMIT 1;

INSERT INTO tasks (title, status, project_id)
SELECT 'Task 2', 'in_progress', id FROM projects LIMIT 1;

INSERT INTO tasks (title, status, project_id)
SELECT 'Task 3', 'done', id FROM projects LIMIT 1;