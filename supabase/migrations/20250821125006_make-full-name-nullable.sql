-- Make full_name nullable for invited members
ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;
