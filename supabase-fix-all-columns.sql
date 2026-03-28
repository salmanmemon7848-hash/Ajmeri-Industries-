-- Fix ALL missing columns in Supabase tables
-- Run this in Supabase SQL Editor

-- ============================================
-- WORKERS TABLE - Add missing columns
-- ============================================
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Labour',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS daily_wage NUMERIC DEFAULT 0;

-- ============================================
-- MILLING_PROCESSES TABLE - Add missing columns
-- ============================================
ALTER TABLE milling_processes 
ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS product TEXT DEFAULT 'Paddy';

-- ============================================
-- Verify all columns exist
-- ============================================
SELECT 'workers table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workers' 
ORDER BY ordinal_position;

SELECT 'milling_processes table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'milling_processes' 
ORDER BY ordinal_position;
