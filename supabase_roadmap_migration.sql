-- Run this in your Supabase SQL Editor
ALTER TABLE roadmap_progress
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
