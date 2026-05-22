-- Migration: Disable RLS for public access
-- Run this in the Supabase SQL Editor to allow the app to read/write data without Auth.

ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE days DISABLE ROW LEVEL SECURITY;
ALTER TABLE meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
