ALTER TABLE todos_tags DROP CONSTRAINT "todos_tags_todo_id_fkey";

ALTER TABLE todos_tags 
  ADD CONSTRAINT "todos_tags_todo_id_fkey"
  FOREIGN KEY("todo_id") REFERENCES "todos"(id)
  ON DELETE CASCADE;

ALTER TABLE todos_tags
  ADD CONSTRAINT "todo_tags_todo_id_tag_id_unique" UNIQUE("todo_id", "tag_id");
