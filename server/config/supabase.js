const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://whqgoovlfbmfgsvqezmy.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocWdvb3ZsZmJtZmdzdnFlem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjY0MDAsImV4cCI6MjA1ODY0MjQwMH0.example_key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database tables
const initDatabase = async () => {
  try {
    // Check if tables exist by trying to query them
    const { data: paddyData, error: paddyError } = await supabase
      .from('paddy_purchases')
      .select('id')
      .limit(1);
    
    if (paddyError && paddyError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating database tables...');
      
      // Create paddy_purchases table
      await supabase.rpc('create_paddy_purchases_table');
      
      // Create other tables
      await supabase.rpc('create_milling_processes_table');
      await supabase.rpc('create_expenses_table');
      await supabase.rpc('create_workers_table');
      await supabase.rpc('create_sales_table');
      await supabase.rpc('create_stock_table');
      
      // Initialize stock
      await supabase.from('stock').insert([{
        id: 1,
        paddy_quantity: 0,
        paddy_unit: 'Qu',
        paddy_bags: 0,
        rice_quantity: 0,
        rice_unit: 'Qu',
        bran_quantity: 0,
        bran_unit: 'Qu',
        broken_quantity: 0,
        broken_unit: 'Qu',
        rafi_quantity: 0,
        rafi_unit: 'Qu',
        husk_quantity: 0,
        husk_unit: 'Qu'
      }]);
      
      console.log('Database tables created successfully');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = { supabase, initDatabase };
