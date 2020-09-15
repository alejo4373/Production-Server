CREATE TABLE todos_tags(
  id SERIAL PRIMARY KEY,
  todo_id INT REFERENCES todos (id),
  tag_id INT REFERENCES tags (id)
);
