-- Add wastage column to milling_processes table
-- Run this in Supabase SQL Editor

ALTER TABLE milling_processes 
ADD COLUMN IF NOT EXISTS wastage NUMERIC DEFAULT 0;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'milling_processes' 
ORDER BY ordinal_position;
