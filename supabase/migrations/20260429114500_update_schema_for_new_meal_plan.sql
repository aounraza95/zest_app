-- Migration: Update schema for new meal plan elements
-- Adds theme to weeks, total_calories to days, and detailed meal info.
-- Also adds a singleton table for plan metadata.

-- 1. Update WEEKS
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS theme TEXT;

-- 2. Update DAYS
ALTER TABLE days ADD COLUMN IF NOT EXISTS total_calories INTEGER;

-- 3. Update MEALS
ALTER TABLE meals ADD COLUMN IF NOT EXISTS qty TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS recipe_note TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS nutrition_highlights TEXT[];

-- 4. PLAN METADATA (Singleton table)
CREATE TABLE IF NOT EXISTS plan_meta (
    id INTEGER PRIMARY KEY DEFAULT 1,
    purpose TEXT,
    gender TEXT,
    age INTEGER,
    location TEXT,
    current_weight_kg REAL,
    target_weight_kg REAL,
    timeline TEXT,
    activity_level TEXT,
    skin_notes TEXT,
    daily_calorie_target INTEGER,
    daily_protein_target_g TEXT,
    meals_per_day INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- Insert default row
INSERT INTO plan_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
