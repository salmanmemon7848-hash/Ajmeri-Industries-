-- Add new columns for Paddy Management updates
-- Run this in Supabase SQL Editor

-- Add new_quantity, old_quantity, total_quantity to paddy_purchases
ALTER TABLE paddy_purchases 
ADD COLUMN IF NOT EXISTS new_quantity NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS old_quantity NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_quantity NUMERIC DEFAULT 0;

-- Update existing rows to set total_quantity = quantity (for backward compatibility)
UPDATE paddy_purchases 
SET total_quantity = quantity 
WHERE total_quantity = 0 AND quantity > 0;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'paddy_purchases' 
ORDER BY ordinal_position;
