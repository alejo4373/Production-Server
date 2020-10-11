ALTER TABLE todos_tags DROP CONSTRAINT "todos_tags_todo_id_fkey";

ALTER TABLE todos_tags 
  ADD CONSTRAINT "todos_tags_todo_id_fkey"
  FOREIGN KEY("todo_id") REFERENCES "todos"(id);

ALTER TABLE todos_tags DROP CONSTRAINT "todo_tags_todo_id_tag_id_unique";
