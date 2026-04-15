-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('likert', 'yesno', 'open')),
  options JSONB NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_questions" ON questions FOR SELECT USING (true);

-- Admin policies (anyone can modify for now - you can add auth later)
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE USING (true);

CREATE POLICY "anon_insert_questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE USING (true);
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_categories_position ON categories(position);
CREATE INDEX idx_questions_position ON questions(position);