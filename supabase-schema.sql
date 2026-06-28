-- ============================================================
-- BINHI Lesson Plan Generator — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase Auth)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  school TEXT,
  division TEXT,
  position TEXT DEFAULT 'Teacher',
  grade_level TEXT,   -- e.g. 'Grade 7', 'Grade 11'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- LESSON PLANS
-- ============================================================
CREATE TABLE lesson_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Curriculum metadata
  grade_level TEXT NOT NULL,         -- 'Grade 7', 'Grade 8', ... 'Grade 12'
  subject TEXT NOT NULL,             -- 'Filipino', 'Math', 'Science', etc.
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 3),
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 10),
  duration_minutes INTEGER DEFAULT 60,

  -- Learning competencies
  learning_competencies TEXT[],      -- Array of MATATAG competency codes + descriptions
  most_essential_lc TEXT,            -- The MELC focused on

  -- Lesson plan content (structured)
  title TEXT,
  objectives JSONB,                  -- { knowledge: [], skills: [], attitude: [] }
  content TEXT,
  learning_resources TEXT[],
  procedures JSONB,                  -- { review, motivation, lesson_proper, generalization, evaluation }
  evaluation TEXT,
  assignment TEXT,
  values_integration TEXT,

  -- Raw generated text (full LP)
  generated_text TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEARNING ACTIVITY SHEETS (LAS)
-- ============================================================
CREATE TABLE activity_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE SET NULL,

  -- Metadata
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 3),
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 10),
  activity_type TEXT DEFAULT 'worksheet'
    CHECK (activity_type IN ('worksheet', 'performance_task', 'formative', 'summative', 'enrichment', 'remediation')),

  -- LAS content
  title TEXT,
  learning_competency TEXT,
  background_info TEXT,
  directions TEXT,
  tasks JSONB,        -- Array of { type, instruction, items[], answer_key[] }
  rubric JSONB,       -- { criteria: [{ name, excellent, satisfactory, needs_improvement }] }

  -- Raw generated text
  generated_text TEXT,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CURRICULUM COMPETENCIES REFERENCE
-- (Seed with MATATAG competencies per subject/grade)
-- ============================================================
CREATE TABLE competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 3),
  week_start INTEGER,
  week_end INTEGER,
  competency_code TEXT,
  competency_description TEXT NOT NULL,
  content_standard TEXT,
  performance_standard TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_competencies_lookup
  ON competencies (grade_level, subject, quarter);

CREATE INDEX idx_lesson_plans_user
  ON lesson_plans (user_id, created_at DESC);

CREATE INDEX idx_activity_sheets_user
  ON activity_sheets (user_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lesson plans: users own their records
CREATE POLICY "Users manage own lesson plans"
  ON lesson_plans FOR ALL USING (auth.uid() = user_id);

-- Activity sheets: users own their records
CREATE POLICY "Users manage own activity sheets"
  ON activity_sheets FOR ALL USING (auth.uid() = user_id);

-- Competencies: public read (reference data)
CREATE POLICY "Anyone can read competencies"
  ON competencies FOR SELECT USING (true);

-- ============================================================
-- SAMPLE COMPETENCY SEEDS (Grade 7-8, Core Subjects)
-- Add more via Supabase dashboard or a seed script
-- ============================================================
INSERT INTO competencies (grade_level, subject, quarter, week_start, week_end, competency_code, competency_description, content_standard, performance_standard) VALUES
-- Grade 7 Filipino Q1
('Grade 7', 'Filipino', 1, 1, 2, 'F7Q1W1', 'Nakapagsasalaysay ng mga pangyayari sa tekstong napakinggan', 'Ang mag-aaral ay nakapagpapakita ng pag-unawa sa mga tekstong napakinggan', 'Ang mag-aaral ay nakapagsasalaysay ng mga pangyayari'),
('Grade 7', 'Filipino', 1, 3, 4, 'F7Q1W3', 'Natutukoy ang mga detalye ng tekstong binasa', 'Ang mag-aaral ay nakapagpapakita ng pag-unawa sa mga tekstong binasa', 'Ang mag-aaral ay natutukoy ang mga detalye'),

-- Grade 7 Math Q1
('Grade 7', 'Mathematics', 1, 1, 2, 'M7Q1W1', 'Describes well-defined sets, subsets, universal sets, and the null set and cardinality of sets', 'The learner demonstrates understanding of key concepts of sets and the real number system', 'The learner is able to solve problems involving sets'),
('Grade 7', 'Mathematics', 1, 3, 4, 'M7Q1W3', 'Illustrates the union and intersection of sets and the difference of two sets', 'The learner demonstrates understanding of key concepts of sets', 'The learner is able to solve problems involving sets'),

-- Grade 7 Science Q1
('Grade 7', 'Science', 1, 1, 2, 'S7Q1W1', 'Describe the components of a scientific investigation', 'The learner demonstrates understanding of scientific investigation', 'The learner is able to conduct simple scientific investigations'),
('Grade 7', 'Science', 1, 3, 4, 'S7Q1W3', 'Differentiate mixtures from substances based on a set of properties', 'The learner demonstrates understanding of mixtures and pure substances', 'The learner is able to separate the components of mixtures'),

-- Grade 7 English Q1
('Grade 7', 'English', 1, 1, 2, 'E7Q1W1', 'Use appropriate strategies before, during, and after reading', 'The learner demonstrates communicative competence through reading literary and informational texts', 'The learner uses appropriate strategies and skills in understanding text'),
('Grade 7', 'English', 1, 3, 4, 'E7Q1W3', 'Identify the distinguishing features of notable literary genres', 'The learner demonstrates understanding of literary genres', 'The learner writes short literary pieces using literary techniques'),

-- Grade 11 Core Q1
('Grade 11', 'Understanding Culture Society and Politics', 1, 1, 2, 'UCSP11Q1W1', 'Explain the concept of culture and society from the perspective of anthropology and sociology', 'The learner demonstrates understanding of culture, society and politics', 'The learner is able to examine social, political and cultural issues'),
('Grade 11', 'Oral Communication', 1, 1, 2, 'OC11Q1W1', 'Explains the nature and elements of oral communication', 'The learner demonstrates understanding of how communication works', 'The learner uses communication strategies effectively'),
('Grade 11', 'General Mathematics', 1, 1, 2, 'GM11Q1W1', 'Represent real-life situations using functions, including piecewise functions', 'The learner demonstrates understanding of key concepts of functions', 'The learner is able to accurately construct mathematical models');
