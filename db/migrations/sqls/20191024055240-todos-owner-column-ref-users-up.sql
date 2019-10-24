ALTER TABLE todos
  ADD owner_id INT REFERENCES users (id);

