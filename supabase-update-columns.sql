-- Add missing columns to Supabase tables
-- Run this in Supabase SQL Editor

-- Add missing columns to paddy_purchases table
ALTER TABLE paddy_purchases 
ADD COLUMN IF NOT EXISTS bag_type TEXT DEFAULT 'New',
ADD COLUMN IF NOT EXISTS price_per_quintal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS quality TEXT DEFAULT 'Good';

-- Add missing columns to milling_processes table (if any)
-- Currently looks complete

-- Add missing columns to sales table (if any)
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to expenses table (if any)
-- Currently looks complete

-- Add missing columns to workers table (if any)
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'paddy_purchases' 
ORDER BY ordinal_position;
