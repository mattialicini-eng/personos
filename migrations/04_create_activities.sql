-- Create activities table for fitness tracking
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- 'workout', 'corsa'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date);
