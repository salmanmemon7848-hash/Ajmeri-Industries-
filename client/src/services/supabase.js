import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://whqgoovlfbmfgsvqezmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocWdvb3ZsZmJtZmdzdnFlem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODg5ODIsImV4cCI6MjA5MDI2NDk4Mn0.qZ86oZ8_OqwaKLoJCe4r19jQ15U-sofhkV2oVIlPmYo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get current timestamp
const now = () => new Date().toISOString();

// Paddy Purchases
export const getPaddyPurchases = async () => {
  const { data, error } = await supabase
    .from('paddy_purchases')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  
  // Transform snake_case to camelCase for frontend
  const transformedData = (data || []).map(item => ({
    _id: item.id,
    farmerName: item.farmer_name,
    quantity: item.quantity,
    newQuantity: item.new_quantity,
    oldQuantity: item.old_quantity,
    totalQuantity: item.total_quantity,
    bags: item.bags,
    bagType: item.bag_type,
    hamali: item.hamali,
    weigherFees: item.weigher_fees,
    transportation: item.transportation,
    otherExpenses: item.other_expenses,
    totalAmount: item.total_amount,
    pricePerQuintal: item.price_per_quintal,
    quality: item.quality,
    date: item.date,
    createdAt: item.created_at
  }));
  
  return { data: { success: true, data: transformedData } };
};

export const addPaddyPurchase = async (purchase) => {
  // Transform camelCase to snake_case for database
  const dbPurchase = {
    farmer_name: purchase.farmerName,
    quantity: purchase.totalQuantity || purchase.quantity,
    new_quantity: purchase.newQuantity,
    old_quantity: purchase.oldQuantity,
    total_quantity: purchase.totalQuantity,
    bags: purchase.bags,
    bag_type: purchase.bagType,
    hamali: purchase.hamali,
    weigher_fees: purchase.weigherFees || 0,
    transportation: purchase.transportation || 0,
    other_expenses: purchase.otherExpenses || 0,
    total_amount: purchase.totalAmount,
    price_per_quintal: purchase.pricePerQuintal || 0,
    quality: purchase.quality || 'Good',
    date: purchase.date,
    created_at: now()
  };
  
  const { data, error } = await supabase
    .from('paddy_purchases')
    .insert([dbPurchase])
    .select()
    .single();
  if (error) throw error;
  
  // Update stock
  await updateStockInternal('paddy', purchase.totalQuantity || purchase.quantity, purchase.bags);
  
  return { data: { success: true, data } };
};

// Milling
export const getMillingProcesses = async () => {
  const { data, error } = await supabase
    .from('milling_processes')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  
  // Transform snake_case to camelCase for frontend
  const transformedData = (data || []).map(item => ({
    _id: item.id,
    quantity: item.quantity || item.quantity_milled,
    rice: item.rice,
    bran: item.bran,
    broken: item.broken,
    rafi: item.rafi,
    husk: item.husk,
    wastage: item.wastage,
    unit: item.unit,
    date: item.date,
    createdAt: item.created_at
  }));
  
  return { data: { success: true, data: transformedData } };
};

export const createMilling = async (milling) => {
  // Transform camelCase to snake_case for database
  const dbMilling = {
    quantity: milling.quantity,
    quantity_milled: milling.quantity,
    rice: milling.rice,
    bran: milling.bran,
    broken: milling.broken,
    rafi: milling.rafi,
    husk: milling.husk,
    wastage: milling.wastage,
    unit: milling.unit,
    date: milling.date,
    created_at: now()
  };
  
  const { data, error } = await supabase
    .from('milling_processes')
    .insert([dbMilling])
    .select()
    .single();
  if (error) throw error;
  
  // Update stock
  await updateStockInternal('paddy', -parseFloat(milling.quantity), 0);
  await updateStockInternal('rice', milling.rice, 0);
  await updateStockInternal('bran', milling.bran, 0);
  await updateStockInternal('broken', milling.broken, 0);
  await updateStockInternal('rafi', milling.rafi, 0);
  await updateStockInternal('husk', milling.husk, 0);
  
  return { data: { success: true, data } };
};

// Expenses
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  
  // Transform snake_case to camelCase for frontend
  const transformedData = (data || []).map(item => ({
    _id: item.id,
    category: item.category,
    description: item.description,
    amount: item.amount,
    date: item.date,
    createdAt: item.created_at
  }));
  
  return { data: { success: true, data: transformedData } };
};

export const addExpense = async (expense) => {
  // Transform camelCase to snake_case for database
  const dbExpense = {
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    created_at: now()
  };
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([dbExpense])
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, data } };
};

export const updateExpense = async (id, expense) => {
  const dbExpense = {
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    updated_at: now()
  };
  
  const { error } = await supabase
    .from('expenses')
    .update(dbExpense)
    .eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

// Workers
export const getWorkers = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  // Transform snake_case to camelCase for frontend
  const transformedData = (data || []).map(item => ({
    _id: item.id,
    name: item.name,
    role: item.role,
    phone: item.phone,
    address: item.address,
    dailyWage: item.daily_wage,
    payments: item.payments || [],
    createdAt: item.created_at
  }));
  
  return { data: { success: true, data: transformedData } };
};

export const addWorker = async (worker) => {
  // Transform camelCase to snake_case for database
  const dbWorker = {
    name: worker.name,
    role: worker.role,
    phone: worker.phone,
    address: worker.address,
    daily_wage: worker.dailyWage,
    payments: worker.payments || [],
    created_at: now()
  };
  
  const { data, error } = await supabase
    .from('workers')
    .insert([dbWorker])
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, data } };
};

// Purchases (Unified)
export const addPurchase = async (purchase) => {
  const dbPurchase = {
    type: purchase.type,
    date: purchase.date,
    supplier_name: purchase.supplierName,
    quantity: purchase.quantity,
    rate: purchase.rate,
    total_amount: purchase.totalAmount,
    rice_mill_hamali: purchase.riceMillHamali,
    warehouse_hamali: purchase.warehouseHamali,
    total_hamali: purchase.totalHamali,
    notes: purchase.notes,
    created_at: now()
  };
  
  const { data, error } = await supabase
    .from('purchases')
    .insert([dbPurchase])
    .select()
    .single();
  if (error) throw error;
  
  // Update stock based on type
  if (purchase.type === 'paddy') {
    await updateStockInternal('paddy', purchase.quantity, 0);
  } else if (purchase.type === 'rice') {
    await updateStockInternal('rice', purchase.quantity, 0);
  }
  
  return { data: { success: true, data } };
};

export const getPurchases = async (type = null) => {
  let query = supabase.from('purchases').select('*').order('date', { ascending: false });
  if (type) query = query.eq('type', type);
  
  const { data, error } = await query;
  if (error) throw error;
  
  const transformedData = (data || []).map(item => ({
    _id: item.id,
    type: item.type,
    date: item.date,
    supplierName: item.supplier_name,
    quantity: item.quantity,
    rate: item.rate,
    totalAmount: item.total_amount,
    riceMillHamali: item.rice_mill_hamali,
    warehouseHamali: item.warehouse_hamali,
    totalHamali: item.total_hamali,
    notes: item.notes,
    createdAt: item.created_at
  }));
  
  return { data: { success: true, data: transformedData } };
};

export const updatePurchase = async (id, purchase) => {
  const dbPurchase = {
    date: purchase.date,
    supplier_name: purchase.supplierName,
    quantity: purchase.quantity,
    rate: purchase.rate,
    total_amount: purchase.totalAmount,
    rice_mill_hamali: purchase.riceMillHamali,
    warehouse_hamali: purchase.warehouseHamali,
    total_hamali: purchase.totalHamali,
    notes: purchase.notes,
    updated_at: now()
  };
  
  const { error } = await supabase
    .from('purchases')
    .update(dbPurchase)
    .eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

export const deletePurchase = async (id) => {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

// Sales
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  
  // Transform snake_case to camelCase for frontend
  const transformedData = (data || []).map(item => ({
    _id: item.id,
    buyerName: item.buyer_name,
    product: item.product,
    quantity: item.quantity,
    rate: item.rate,
    totalAmount: item.total_amount,
    description: item.description,
    date: item.date,
    createdAt: item.created_at
  }));
  
  return { data: { success: true, data: transformedData } };
};

export const addSale = async (sale) => {
  // Transform camelCase to snake_case for database
  const dbSale = {
    buyer_name: sale.buyerName,
    product: sale.product,
    quantity: sale.quantity,
    rate: sale.rate,
    total_amount: sale.totalAmount,
    description: sale.description,
    date: sale.date,
    created_at: now()
  };
  
  const { data, error } = await supabase
    .from('sales')
    .insert([dbSale])
    .select()
    .single();
  if (error) throw error;
  
  // Update stock
  const product = sale.product?.toLowerCase();
  if (product) {
    await updateStockInternal(product, -parseFloat(sale.quantity), 0);
  }
  
  return { data: { success: true, data } };
};

export const updateSale = async (id, sale) => {
  const dbSale = {
    buyer_name: sale.buyerName,
    product: sale.product,
    quantity: sale.quantity,
    rate: sale.rate,
    total_amount: sale.totalAmount,
    description: sale.description,
    date: sale.date,
    updated_at: now()
  };
  
  const { error } = await supabase
    .from('sales')
    .update(dbSale)
    .eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

export const deleteSale = async (id) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

// Stock
export const getStock = async () => {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  
  return { data: { success: true, data: {
    paddy: { quantity: data?.paddy_quantity || 0, unit: data?.paddy_unit || 'Qu', bags: data?.paddy_bags || 0 },
    rice: { quantity: data?.rice_quantity || 0, unit: data?.rice_unit || 'Qu' },
    bran: { quantity: data?.bran_quantity || 0, unit: data?.bran_unit || 'Qu' },
    broken: { quantity: data?.broken_quantity || 0, unit: data?.broken_unit || 'Qu' },
    rafi: { quantity: data?.rafi_quantity || 0, unit: data?.rafi_unit || 'Qu' },
    husk: { quantity: data?.husk_quantity || 0, unit: data?.husk_unit || 'Qu' }
  }}};
};

const updateStockInternal = async (product, quantityChange, bagsChange = 0) => {
  const { data: current } = await supabase
    .from('stock')
    .select('*')
    .eq('id', 1)
    .single();
  
  const updates = {};
  if (product === 'paddy') {
    updates.paddy_quantity = (current?.paddy_quantity || 0) + parseFloat(quantityChange);
    updates.paddy_bags = (current?.paddy_bags || 0) + parseInt(bagsChange);
  } else {
    updates[`${product}_quantity`] = (current?.[`${product}_quantity`] || 0) + parseFloat(quantityChange);
  }
  
  await supabase.from('stock').update(updates).eq('id', 1);
};

export const resetAllData = async () => {
  await supabase.from('paddy_purchases').delete().neq('id', 0);
  await supabase.from('milling_processes').delete().neq('id', 0);
  await supabase.from('expenses').delete().neq('id', 0);
  await supabase.from('workers').delete().neq('id', 0);
  await supabase.from('sales').delete().neq('id', 0);
  await supabase.from('stock').update({
    paddy_quantity: 0, paddy_bags: 0,
    rice_quantity: 0, bran_quantity: 0,
    broken_quantity: 0, rafi_quantity: 0, husk_quantity: 0
  }).eq('id', 1);
  return { data: { success: true, message: 'All data reset' } };
};

// Delete all data for specific sections
export const deleteAllPurchases = async () => {
  const { error } = await supabase.from('purchases').delete().neq('id', 0);
  if (error) throw error;
  return { data: { success: true, message: 'All purchases deleted' } };
};

export const deleteAllSales = async () => {
  const { error } = await supabase.from('sales').delete().neq('id', 0);
  if (error) throw error;
  return { data: { success: true, message: 'All sales deleted' } };
};

export const deleteAllExpenses = async () => {
  const { error } = await supabase.from('expenses').delete().neq('id', 0);
  if (error) throw error;
  return { data: { success: true, message: 'All expenses deleted' } };
};

export const deleteAllMilling = async () => {
  const { error } = await supabase.from('milling_processes').delete().neq('id', 0);
  if (error) throw error;
  return { data: { success: true, message: 'All milling records deleted' } };
};

export const deleteAllPaddyPurchases = async () => {
  const { error } = await supabase.from('paddy_purchases').delete().neq('id', 0);
  if (error) throw error;
  return { data: { success: true, message: 'All paddy purchases deleted' } };
};

export const deleteAllWorkers = async () => {
  const { error } = await supabase.from('workers').delete().neq('id', 0);
  if (error) throw error;
  return { data: { success: true, message: 'All workers deleted' } };
};

// Reports
export const getDailyReport = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: purchases } = await supabase
    .from('paddy_purchases')
    .select('*')
    .gte('date', today);
  
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', today);
  
  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .gte('date', today);
  
  const { data: milling } = await supabase
    .from('milling_processes')
    .select('*')
    .gte('date', today);
  
  const totalSales = sales?.reduce((s, x) => s + (parseFloat(x.total_amount) || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) || 0;
  const totalHamali = purchases?.reduce((s, p) => s + (parseFloat(p.hamali) || 0), 0) || 0;
  
  return { data: { success: true, data: {
    date: new Date().toISOString(),
    purchases: { count: purchases?.length || 0, totalHamali },
    milling: { totalQuantity: milling?.reduce((s, m) => s + (parseFloat(m.quantity_milled) || 0), 0) || 0 },
    expenses: { total: totalExpenses },
    sales: { total: totalSales },
    profit: { totalSales, totalExpenses, netProfit: totalSales - totalExpenses }
  }}};
};

export const getMonthlyReport = async () => {
  const { data: purchases } = await supabase.from('paddy_purchases').select('*');
  const { data: expenses } = await supabase.from('expenses').select('*');
  const { data: sales } = await supabase.from('sales').select('*');
  const { data: milling } = await supabase.from('milling_processes').select('*');
  
  const monthSales = sales?.reduce((s, x) => s + (parseFloat(x.total_amount) || 0), 0) || 0;
  const monthExpenses = expenses?.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) || 0;
  const monthHamali = purchases?.reduce((s, p) => s + (parseFloat(p.hamali) || 0), 0) || 0;
  
  return { data: { success: true, data: {
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    purchases: {
      count: purchases?.length || 0,
      totalQuantity: purchases?.reduce((s, p) => s + (parseFloat(p.quantity) || 0), 0) || 0,
      totalHamali: monthHamali
    },
    milling: { totalQuantity: milling?.reduce((s, m) => s + (parseFloat(m.quantity_milled) || 0), 0) || 0 },
    expenses: { operational: monthExpenses, workerPayments: 0, hamali: monthHamali, total: monthExpenses },
    sales: { total: monthSales },
    profit: { totalSales: monthSales, totalExpenses: monthExpenses, netProfit: monthSales - monthExpenses }
  }}};
};

export const getDashboardSummary = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: stock } = await getStock();
  const { data: purchases } = await supabase.from('paddy_purchases').select('*').gte('date', today);
  const { data: expenses } = await supabase.from('expenses').select('*').gte('date', today);
  const { data: sales } = await supabase.from('sales').select('*').gte('date', today);
  
  return { data: { success: true, data: {
    stock: stock?.data,
    today: {
      purchases: purchases?.length || 0,
      expenses: expenses?.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) || 0,
      sales: sales?.reduce((s, x) => s + (parseFloat(x.total_amount) || 0), 0) || 0,
      milling: 0
    },
    monthly: {
      totalExpenses: 0,
      totalSales: 0,
      netProfit: 0
    }
  }}};
};

// Placeholder functions for compatibility
export const getErrorMessage = (error) => error?.message || 'An error occurred';
export const updatePaddyPurchase = () => Promise.resolve({ data: { success: true } });
export const deletePaddyPurchase = () => Promise.resolve({ data: { success: true } });
export const updateMilling = () => Promise.resolve({ data: { success: true } });
export const deleteMilling = () => Promise.resolve({ data: { success: true } });
export const updateStock = () => Promise.resolve({ data: { success: true } });
export const getWorkerById = () => Promise.resolve({ data: { success: true, data: {} } });
export const addWorkerPayment = async (workerId, payment) => {
  // Get current worker
  const { data: worker, error: fetchError } = await supabase
    .from('workers')
    .select('payments')
    .eq('id', workerId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Add new payment to the array
  const currentPayments = worker?.payments || [];
  const newPayment = {
    date: payment.date,
    amount: payment.amount,
    type: payment.type,
    created_at: now()
  };
  const updatedPayments = [...currentPayments, newPayment];
  
  // Update worker with new payments array
  const { error: updateError } = await supabase
    .from('workers')
    .update({ payments: updatedPayments })
    .eq('id', workerId);
  
  if (updateError) throw updateError;
  return { data: { success: true } };
};
export const deleteWorker = () => Promise.resolve({ data: { success: true } });
export const getExpensesByDate = () => getExpenses();
export const getDailyExpenses = () => getExpenses();
export const getMonthlyExpenses = () => getExpenses();
export const getSalesByDate = () => getSales();
export const getDailySales = () => getSales();
export const getMonthlySales = () => getSales();
export const processMilling = (data) => createMilling(data);
export const getMillingByDate = () => getMillingProcesses();
export const getPaddyPurchasesByDate = () => getPaddyPurchases();
