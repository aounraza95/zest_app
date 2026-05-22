-- Refactor cooking sessions to use a relational table for cook items
-- Migration: 20260512104500_refactor_cook_items_table.sql

-- 1. Create the new cooking_items table
CREATE TABLE IF NOT EXISTS public.cooking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT REFERENCES public.cooking_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    quantity TEXT,
    cook_method TEXT,
    instructions TEXT,
    portion_into INTEGER,
    portion_size TEXT,
    storage_type TEXT,
    storage_days INTEGER,
    storage_note TEXT,
    usage JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. (Optional) If there is data in the old column, we could attempt to migrate it here.
-- But for a clean refactor during development, we will just clear and start fresh.

-- 3. Remove the redundant JSONB column from cooking_sessions
ALTER TABLE public.cooking_sessions DROP COLUMN IF EXISTS cook_items;

-- 4. Enable RLS
ALTER TABLE public.cooking_items ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Users can manage their own cooking items"
ON public.cooking_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.cooking_sessions
        WHERE public.cooking_sessions.id = public.cooking_items.session_id
    )
);
