-- Doping a column removes indexes too
ALTER TABLE todos
  DROP text_searchable;

ALTER TABLE journal_entries
  DROP text_searchable;
