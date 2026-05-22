-- Migration: Switch UUID columns to TEXT to support existing app IDs
-- Run this in the Supabase SQL Editor

-- 1. Disable constraints temporarily (relying on manual drop/recreate)
ALTER TABLE meals DROP CONSTRAINT IF EXISTS meals_day_id_fkey;
ALTER TABLE days DROP CONSTRAINT IF EXISTS days_week_id_fkey;
ALTER TABLE grocery_items DROP CONSTRAINT IF EXISTS grocery_items_week_id_fkey;
ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_active_week_override_fkey;

-- 2. Change columns in days
ALTER TABLE days ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE days ALTER COLUMN id SET DEFAULT NULL; -- Remove default gen_random_uuid

-- 3. Change columns in meal_definitions
ALTER TABLE meal_definitions ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE meal_definitions ALTER COLUMN id SET DEFAULT NULL;

-- 4. Change columns in meals
ALTER TABLE meals ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE meals ALTER COLUMN day_id TYPE TEXT USING day_id::text;
ALTER TABLE meals ALTER COLUMN definition_id TYPE TEXT USING definition_id::text;
ALTER TABLE meals ALTER COLUMN id SET DEFAULT NULL;

-- 5. Change columns in grocery_items
ALTER TABLE grocery_items ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE grocery_items ALTER COLUMN id SET DEFAULT NULL;

-- 6. Re-add foreign keys
ALTER TABLE days ADD CONSTRAINT days_week_id_fkey FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE;
ALTER TABLE meals ADD CONSTRAINT meals_day_id_fkey FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE;
ALTER TABLE grocery_items ADD CONSTRAINT grocery_items_week_id_fkey FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE;
ALTER TABLE app_settings ADD CONSTRAINT app_settings_active_week_override_fkey FOREIGN KEY (active_week_override) REFERENCES weeks(id);
