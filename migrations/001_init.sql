-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Profile table (single row of configuration)
CREATE TABLE IF NOT EXISTS profile (
  id INT PRIMARY KEY DEFAULT 1,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  city TEXT,
  focus TEXT,
  habits JSONB DEFAULT '[]',
  calorie_goal INT DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK (id = 1)
);

-- Captures table (raw captures from all sources)
CREATE TABLE IF NOT EXISTS captures (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  classification TEXT,
  destination TEXT,
  classification_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  urgency INT DEFAULT 5,
  priority INT DEFAULT 5,
  tags TEXT[],
  due_date DATE,
  person_id BIGINT REFERENCES people(id),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- People table
CREATE TABLE IF NOT EXISTS people (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT,
  type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily logs table (one row per day with JSON fields)
CREATE TABLE IF NOT EXISTS daily_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE UNIQUE NOT NULL,
  habits JSONB DEFAULT '{}',
  meals JSONB DEFAULT '[]',
  goals JSONB DEFAULT '{}',
  finance JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory table (with vector embeddings for semantic search)
CREATE TABLE IF NOT EXISTS memory (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registry table (audit log of actions)
CREATE TABLE IF NOT EXISTS registry (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_captures_user ON captures(user_id);
CREATE INDEX IF NOT EXISTS idx_captures_created ON captures(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_people_user ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_memory_user ON memory(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_created ON memory(created_at);
CREATE INDEX IF NOT EXISTS idx_registry_user ON registry(user_id);

-- Create HNSW index for vector search
CREATE INDEX IF NOT EXISTS idx_memory_embedding ON memory USING hnsw (embedding vector_cosine_ops);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_memory(
  query_embedding vector,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  text text,
  source text,
  similarity float
) LANGUAGE SQL STABLE AS $$
  SELECT
    memory.id,
    memory.text,
    memory.source,
    1 - (memory.embedding <=> query_embedding) AS similarity
  FROM memory
  WHERE memory.user_id = auth.uid()::text
  ORDER BY memory.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Enable RLS
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry ENABLE ROW LEVEL SECURITY;

-- RLS Policies (deny all except service role)
CREATE POLICY "Deny all access" ON profile FOR ALL USING (FALSE);
CREATE POLICY "Deny all access" ON captures FOR ALL USING (FALSE);
CREATE POLICY "Deny all access" ON tasks FOR ALL USING (FALSE);
CREATE POLICY "Deny all access" ON people FOR ALL USING (FALSE);
CREATE POLICY "Deny all access" ON daily_logs FOR ALL USING (FALSE);
CREATE POLICY "Deny all access" ON memory FOR ALL USING (FALSE);
CREATE POLICY "Deny all access" ON registry FOR ALL USING (FALSE);
