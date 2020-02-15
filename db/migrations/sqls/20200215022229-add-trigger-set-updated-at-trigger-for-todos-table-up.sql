/* 
Create a function and use as trigger for automatically
setting column updated_at in todos table with a timestamp 
of when update happend
*/ 

CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS trigger 
  LANGUAGE plpgsql
AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$$;

CREATE TRIGGER update_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();
