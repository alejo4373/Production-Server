ALTER TABLE todos
  ADD COLUMN text_searchable tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', todos.text)) STORED;

ALTER TABLE journal_entries
  ADD COLUMN text_searchable tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', journal_entries.text)) STORED;

CREATE INDEX todos_text_searchable_idx ON todos USING GIN (text_searchable);

CREATE INDEX je_text_searchable_idx ON journal_entries USING GIN (text_searchable);
