CREATE TABLE "lists" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id INTEGER NOT NULL
);

ALTER TABLE "todos" ADD COLUMN "list_id" INT;
ALTER TABLE "todos" ADD FOREIGN KEY ("list_id") REFERENCES "lists" ("id");
