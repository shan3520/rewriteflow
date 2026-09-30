-- RewriteAI Supabase Schema
-- Run this in your Supabase SQL editor

-- Users table (mirrors Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-populate users table on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rewrites table
CREATE TABLE IF NOT EXISTS public.rewrites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  rewritten_text TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('standard', 'academic', 'aggressive', 'simplified', 'creative', 'workflow')),
  workflow_name TEXT,
  original_word_count INTEGER DEFAULT 0,
  rewritten_word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved workflows: an ordered list of steps from shared/steps.json plus an
-- optional free-text instruction.
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description TEXT NOT NULL DEFAULT '',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_instruction TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON public.workflows (user_id, updated_at DESC);

-- ──────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────
-- Note: The backend uses the Supabase service-role key which
-- bypasses RLS entirely. These policies protect against direct
-- frontend access via the anon key.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewrites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Users can only read their own user record
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can read their own rewrites
CREATE POLICY "Users can view own rewrites"
  ON public.rewrites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own rewrites
CREATE POLICY "Users can insert own rewrites"
  ON public.rewrites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rewrites
CREATE POLICY "Users can update own rewrites"
  ON public.rewrites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own rewrites
CREATE POLICY "Users can delete own rewrites"
  ON public.rewrites FOR DELETE
  USING (auth.uid() = user_id);

-- Users can manage only their own workflows
CREATE POLICY "Users can view own workflows"
  ON public.workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON public.workflows FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON public.workflows FOR DELETE
  USING (auth.uid() = user_id);
