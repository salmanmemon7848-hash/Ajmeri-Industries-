-- Add description column to sales table
-- Run this in Supabase SQL Editor

ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sales' 
ORDER BY ordinal_position;
