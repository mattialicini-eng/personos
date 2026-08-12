-- Add category column to todo_items
ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Sikuro';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_todo_category ON todo_items(user_id, category);
