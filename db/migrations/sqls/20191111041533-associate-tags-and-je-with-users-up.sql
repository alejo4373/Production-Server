ALTER TABLE journal_entries
  ADD owner_id INT REFERENCES users (id);

ALTER TABLE tags
  ADD owner_id INT REFERENCES users (id);

