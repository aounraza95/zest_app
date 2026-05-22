-- Migration: Add calories to meals table
-- Adds a TEXT column for calories to allow flexible entries (e.g. "500", "500 kcal").

ALTER TABLE meals ADD COLUMN IF NOT EXISTS calories TEXT;
