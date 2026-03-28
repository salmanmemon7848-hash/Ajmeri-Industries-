-- Supabase Database Setup for Ajmeri Industries Rice Mill
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (RLS) for all tables
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create paddy_purchases table
CREATE TABLE IF NOT EXISTS paddy_purchases (
    id SERIAL PRIMARY KEY,
    farmer_name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    bags INTEGER DEFAULT 0,
    hamali NUMERIC DEFAULT 0,
    weigher_fees NUMERIC DEFAULT 0,
    transportation NUMERIC DEFAULT 0,
    other_expenses NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milling_processes table
CREATE TABLE IF NOT EXISTS milling_processes (
    id SERIAL PRIMARY KEY,
    quantity_milled NUMERIC DEFAULT 0,
    rice NUMERIC DEFAULT 0,
    bran NUMERIC DEFAULT 0,
    broken NUMERIC DEFAULT 0,
    rafi NUMERIC DEFAULT 0,
    husk NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'Qu',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    daily_wage NUMERIC DEFAULT 0,
    payments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    buyer_name TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    rate NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY DEFAULT 1,
    paddy_quantity NUMERIC DEFAULT 0,
    paddy_unit TEXT DEFAULT 'Qu',
    paddy_bags INTEGER DEFAULT 0,
    rice_quantity NUMERIC DEFAULT 0,
    rice_unit TEXT DEFAULT 'Qu',
    bran_quantity NUMERIC DEFAULT 0,
    bran_unit TEXT DEFAULT 'Qu',
    broken_quantity NUMERIC DEFAULT 0,
    broken_unit TEXT DEFAULT 'Qu',
    rafi_quantity NUMERIC DEFAULT 0,
    rafi_unit TEXT DEFAULT 'Qu',
    husk_quantity NUMERIC DEFAULT 0,
    husk_unit TEXT DEFAULT 'Qu',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stock record
INSERT INTO stock (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Real-time for all tables
ALTER TABLE paddy_purchases REPLICA IDENTITY FULL;
ALTER TABLE milling_processes REPLICA IDENTITY FULL;
ALTER TABLE expenses REPLICA IDENTITY FULL;
ALTER TABLE workers REPLICA IDENTITY FULL;
ALTER TABLE sales REPLICA IDENTITY FULL;
ALTER TABLE stock REPLICA IDENTITY FULL;

-- Create publication for real-time
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE paddy_purchases, milling_processes, expenses, workers, sales, stock;

-- Grant permissions
GRANT ALL ON paddy_purchases TO anon, authenticated;
GRANT ALL ON milling_processes TO anon, authenticated;
GRANT ALL ON expenses TO anon, authenticated;
GRANT ALL ON workers TO anon, authenticated;
GRANT ALL ON sales TO anon, authenticated;
GRANT ALL ON stock TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable RLS but allow all access (for simplicity)
ALTER TABLE paddy_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE milling_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON paddy_purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON milling_processes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON stock FOR ALL USING (true) WITH CHECK (true);
