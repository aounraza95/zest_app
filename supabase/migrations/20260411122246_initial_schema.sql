-- 1. MEAL DEFINITIONS (Slots like Breakfast, Lunch, etc.)
CREATE TABLE IF NOT EXISTS meal_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    default_time TEXT,
    notify BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WEEKS (The 4-week cycle)
CREATE TABLE IF NOT EXISTS weeks (
    id TEXT PRIMARY KEY, -- e.g. "week-0", "week-1"
    label TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DAYS (Monday - Sunday for each week)
CREATE TABLE IF NOT EXISTS days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id TEXT NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
    day_index INTEGER NOT NULL,
    day_of_week TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MEALS (Actual planned meals)
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
    definition_id UUID, -- Links to meal_definitions.id
    name TEXT NOT NULL DEFAULT '',
    notes TEXT,
    is_done BOOLEAN DEFAULT false,
    "time" TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GROCERY ITEMS
CREATE TABLE IF NOT EXISTS grocery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id TEXT NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity TEXT,
    category TEXT DEFAULT 'Uncategorized',
    is_checked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. APP SETTINGS (Global settings)
CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    is_grocery_reminder_enabled BOOLEAN DEFAULT false,
    grocery_reminder_day INTEGER DEFAULT 5,
    grocery_reminder_time TEXT DEFAULT '09:00',
    active_week_override TEXT REFERENCES weeks(id),
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- INITIAL SEED DATA
INSERT INTO weeks (id, label, "index") VALUES 
('week-0', 'Week 1', 0),
('week-1', 'Week 2', 1),
('week-2', 'Week 3', 2),
('week-3', 'Week 4', 3)
ON CONFLICT (id) DO NOTHING;

-- Initial Meal Definitions
INSERT INTO meal_definitions (id, name, default_time, notify) VALUES 
('00000000-0000-0000-0000-000000000001', 'Breakfast', '08:00', true),
('00000000-0000-0000-0000-000000000002', 'Lunch', '13:00', true),
('00000000-0000-0000-0000-000000000003', 'Dinner', '19:00', true),
('00000000-0000-0000-0000-000000000004', 'Snack', '16:00', false)
ON CONFLICT (id) DO NOTHING;

-- Initial Settings
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
