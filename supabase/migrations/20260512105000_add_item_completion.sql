-- Add is_completed column to cooking_items
-- Migration: 20260512105000_add_item_completion.sql

ALTER TABLE public.cooking_items 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
