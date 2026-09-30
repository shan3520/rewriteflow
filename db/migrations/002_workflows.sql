-- Migration 002: saved workflows.
-- Run once in the Supabase SQL editor on databases created from an older
-- db/schema.sql. Safe to re-run.

-- Drop the unused placeholder tables from earlier versions of the schema.
DROP TABLE IF EXISTS public.pipeline_templates;
DROP TABLE IF EXISTS public.rewrite_jobs;

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

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own workflows" ON public.workflows;
CREATE POLICY "Users can view own workflows"
  ON public.workflows FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own workflows" ON public.workflows;
CREATE POLICY "Users can insert own workflows"
  ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own workflows" ON public.workflows;
CREATE POLICY "Users can update own workflows"
  ON public.workflows FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own workflows" ON public.workflows;
CREATE POLICY "Users can delete own workflows"
  ON public.workflows FOR DELETE USING (auth.uid() = user_id);

-- Rewrites made with a workflow store mode = 'workflow' and the workflow's name.
ALTER TABLE public.rewrites ADD COLUMN IF NOT EXISTS workflow_name TEXT;
ALTER TABLE public.rewrites DROP CONSTRAINT IF EXISTS rewrites_mode_check;
ALTER TABLE public.rewrites ADD CONSTRAINT rewrites_mode_check
  CHECK (mode IN ('standard', 'academic', 'aggressive', 'simplified', 'creative', 'workflow'));
