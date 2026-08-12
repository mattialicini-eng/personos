-- Create meals table for daily nutrition tracking
CREATE TABLE IF NOT EXISTS meals (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL, -- 'colazione', 'pranzo', 'cena'
  status TEXT NOT NULL, -- 'good', 'bad'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date, meal_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
