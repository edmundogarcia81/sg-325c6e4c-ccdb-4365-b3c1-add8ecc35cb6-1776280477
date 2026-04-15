-- Tabla principal de encuestas
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  unique_link_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

-- Tabla de respuestas individuales
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer_value TEXT NULL,
  is_not_my_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_surveys_email ON surveys(email);
CREATE INDEX idx_surveys_token ON surveys(unique_link_token);
CREATE INDEX idx_responses_survey ON survey_responses(survey_id);

-- RLS: Permitir lectura pública de encuestas por token
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read" ON surveys FOR SELECT USING (true);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read" ON survey_responses FOR SELECT USING (true);