-- Update paddy_purchases table for Ajmeri Industries
-- Add description and total_quintal columns, remove total_amount if not needed

-- Add description column (text type, optional)
ALTER TABLE paddy_purchases 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add total_quintal column (decimal type)
ALTER TABLE paddy_purchases 
ADD COLUMN IF NOT EXISTS total_quintal NUMERIC DEFAULT 0;

-- Optional: Remove total_amount column if it's not used elsewhere
-- Uncomment the line below ONLY if you're sure total_amount is not needed
-- ALTER TABLE paddy_purchases DROP COLUMN IF EXISTS total_amount;

-- Update existing records to calculate total_quintal from total_quantity
UPDATE paddy_purchases 
SET total_quintal = (total_quantity / 2.5)
WHERE total_quintal IS NULL OR total_quintal = 0;
