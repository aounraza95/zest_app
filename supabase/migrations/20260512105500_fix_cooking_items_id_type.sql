-- Fix cooking_items id type to support custom string IDs from JSON
-- Migration: 20260512105500_fix_cooking_items_id_type.sql

-- 1. Change id column type to TEXT
ALTER TABLE public.cooking_items ALTER COLUMN id TYPE TEXT;

-- 2. Ensure default is still sensible for new items generated in-app
-- (Though generateId() handles it on the client side usually)
ALTER TABLE public.cooking_items ALTER COLUMN id DROP DEFAULT;
