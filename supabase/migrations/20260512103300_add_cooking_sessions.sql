-- Recreate the cooking sessions table with expanded fields
DROP TABLE IF EXISTS public.cooking_sessions;

CREATE TABLE public.cooking_sessions (
  id TEXT PRIMARY KEY,
  week_id TEXT REFERENCES public.weeks(id) ON DELETE CASCADE,
  session_type TEXT,
  day TEXT,
  day_index INTEGER NOT NULL,
  label TEXT NOT NULL,
  estimated_duration TEXT,
  best_time TEXT,
  kitchen_note TEXT,
  cook_items JSONB NOT NULL DEFAULT '[]',
  prep_ahead TEXT[] NOT NULL DEFAULT '{}',
  equipment_needed TEXT[] NOT NULL DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cooking_sessions ENABLE ROW LEVEL SECURITY;

-- Simple public access policy
CREATE POLICY "Public Access" ON public.cooking_sessions FOR ALL USING (true);
