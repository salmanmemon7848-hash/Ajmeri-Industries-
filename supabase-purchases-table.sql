-- Create unified purchases table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('paddy', 'rice')),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier_name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    rate NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    rice_mill_hamali NUMERIC DEFAULT 0,
    warehouse_hamali NUMERIC DEFAULT 0,
    total_hamali NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Real-time
ALTER TABLE purchases REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE purchases;

-- Grant permissions
GRANT ALL ON purchases TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE purchases_id_seq TO anon, authenticated;

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON purchases FOR ALL USING (true) WITH CHECK (true);

-- Also update paddy_purchases table with new hamali columns
ALTER TABLE paddy_purchases 
ADD COLUMN IF NOT EXISTS rice_mill_hamali NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS warehouse_hamali NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_hamali NUMERIC DEFAULT 0;

-- Verify
SELECT 'purchases table created successfully' as status;
