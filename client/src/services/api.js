// Pure localStorage-based API - no server needed
// Works on Vercel, offline, and everywhere!

// Check if we're in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined';
};

// Default data structure
const defaultData = {
  paddyPurchases: [],
  millingProcesses: [],
  expenses: [],
  workers: [],
  sales: [],
  stock: {
    paddy: { quantity: 0, unit: 'Qu', bags: 0 },
    rice: { quantity: 0, unit: 'Qu' },
    bran: { quantity: 0, unit: 'Qu' },
    broken: { quantity: 0, unit: 'Qu' },
    rafi: { quantity: 0, unit: 'Qu' },
    husk: { quantity: 0, unit: 'Qu' }
  }
};

// Local storage helpers
const getLocalData = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem('riceMillData');
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.error('localStorage error:', e);
  }
  return { ...defaultData };
};

const saveLocalData = (data) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('riceMillData', JSON.stringify(data));
    }
  } catch (e) {
    console.error('localStorage save error:', e);
  }
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Simulate API response
const simulateResponse = (data) => ({ data: { success: true, data } });

// Get data from appropriate source
const getData = async () => {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.getData();
  }
  return getLocalData();
};

// Save data to appropriate source
const saveData = async (data) => {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.saveData(data);
  }
  saveLocalData(data);
  return true;
};

// Helper function to get user-friendly error message
export const getErrorMessage = (error) => {
  return error?.message || 'An unexpected error occurred';
};

// Handle all API requests locally
const handleRequest = async (endpoint, method, requestData = null) => {
  const db = await getData();
  const id = generateId();
  const now = new Date().toISOString();
  
  switch (endpoint) {
    case '/paddy':
      if (method === 'get') {
        return simulateResponse(db.paddyPurchases);
      } else if (method === 'post') {
        const item = { _id: id, ...requestData, date: requestData.date || now };
        db.paddyPurchases.push(item);
        db.stock.paddy.quantity += parseFloat(requestData.quantity) || 0;
        db.stock.paddy.bags += parseInt(requestData.bags) || 0;
        await saveData(db);
        return simulateResponse(item);
      }
      break;
      
    case '/milling':
      if (method === 'get') {
        return simulateResponse(db.millingProcesses);
      } else if (method === 'post') {
        const item = { 
          _id: id, 
          ...requestData, 
          date: requestData.date || now,
          quantityMilled: parseFloat(requestData.quantity),
          outputs: {
            rice: { quantity: parseFloat(requestData.rice) || 0, unit: requestData.unit },
            bran: { quantity: parseFloat(requestData.bran) || 0, unit: requestData.unit },
            broken: { quantity: parseFloat(requestData.broken) || 0, unit: requestData.unit },
            rafi: { quantity: parseFloat(requestData.rafi) || 0, unit: requestData.unit },
            husk: { quantity: parseFloat(requestData.husk) || 0, unit: requestData.unit }
          }
        };
        db.millingProcesses.push(item);
        db.stock.paddy.quantity -= parseFloat(requestData.quantity) || 0;
        db.stock.rice.quantity += parseFloat(requestData.rice) || 0;
        db.stock.bran.quantity += parseFloat(requestData.bran) || 0;
        db.stock.broken.quantity += parseFloat(requestData.broken) || 0;
        db.stock.rafi.quantity += parseFloat(requestData.rafi) || 0;
        db.stock.husk.quantity += parseFloat(requestData.husk) || 0;
        await saveData(db);
        return simulateResponse(item);
      }
      break;
      
    case '/expenses':
      if (method === 'get') {
        return simulateResponse(db.expenses);
      } else if (method === 'post') {
        const item = { _id: id, ...requestData, date: requestData.date || now };
        db.expenses.push(item);
        await saveData(db);
        return simulateResponse(item);
      }
      break;
      
    case '/workers':
      if (method === 'get') {
        return simulateResponse(db.workers);
      } else if (method === 'post') {
        const item = { _id: id, ...requestData, payments: [] };
        db.workers.push(item);
        await saveData(db);
        return simulateResponse(item);
      }
      break;
      
    case '/sales':
      if (method === 'get') {
        return simulateResponse(db.sales);
      } else if (method === 'post') {
        const item = { _id: id, ...requestData, date: requestData.date || now };
        db.sales.push(item);
        const product = requestData.product?.toLowerCase();
        if (product && db.stock[product]) {
          db.stock[product].quantity -= parseFloat(requestData.quantity) || 0;
        }
        await saveData(db);
        return simulateResponse(item);
      }
      break;
      
    case '/stock':
      if (method === 'get') {
        return simulateResponse(db.stock);
      }
      break;
      
    case '/stock/reset-all':
      if (method === 'post') {
        const emptyDB = { ...defaultData };
        await saveData(emptyDB);
        return simulateResponse({ message: 'All data reset successfully' });
      }
      break;
      
    case '/reports/daily':
      if (method === 'get') {
        const today = new Date().toDateString();
        const todayPurchases = db.paddyPurchases.filter(p => new Date(p.date).toDateString() === today);
        const todayExpenses = db.expenses.filter(e => new Date(e.date).toDateString() === today);
        const todaySales = db.sales.filter(s => new Date(s.date).toDateString() === today);
        const todayMilling = db.millingProcesses.filter(m => new Date(m.date).toDateString() === today);
        
        const totalSales = todaySales.reduce((s, x) => s + (parseFloat(x.totalAmount) || 0), 0);
        const totalExpenses = todayExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const totalHamali = todayPurchases.reduce((s, p) => s + (parseFloat(p.hamali) || 0), 0);
        
        return simulateResponse({
          date: new Date().toISOString(),
          purchases: {
            count: todayPurchases.length,
            totalHamali: totalHamali
          },
          milling: {
            totalQuantity: todayMilling.reduce((s, m) => s + (parseFloat(m.quantityMilled) || 0), 0)
          },
          expenses: {
            total: totalExpenses
          },
          sales: {
            total: totalSales
          },
          profit: {
            totalSales: totalSales,
            totalExpenses: totalExpenses,
            netProfit: totalSales - totalExpenses
          }
        });
      }
      break;
      
    case '/reports/monthly':
      if (method === 'get') {
        const monthExpenses = db.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const monthSales = db.sales.reduce((s, x) => s + (parseFloat(x.totalAmount) || 0), 0);
        const monthHamali = db.paddyPurchases.reduce((s, p) => s + (parseFloat(p.hamali) || 0), 0);
        
        return simulateResponse({
          month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          purchases: {
            count: db.paddyPurchases.length,
            totalQuantity: db.paddyPurchases.reduce((s, p) => s + (parseFloat(p.quantity) || 0), 0),
            totalHamali: monthHamali
          },
          milling: {
            totalQuantity: db.millingProcesses.reduce((s, m) => s + (parseFloat(m.quantityMilled) || 0), 0)
          },
          expenses: {
            operational: monthExpenses,
            workerPayments: 0,
            hamali: monthHamali,
            total: monthExpenses
          },
          sales: {
            total: monthSales
          },
          profit: {
            totalSales: monthSales,
            totalExpenses: monthExpenses,
            netProfit: monthSales - monthExpenses
          }
        });
      }
      break;
      
    case '/reports/dashboard':
      if (method === 'get') {
        const today = new Date().toDateString();
        return simulateResponse({
          stock: db.stock,
          today: {
            purchases: db.paddyPurchases.filter(p => new Date(p.date).toDateString() === today).length,
            expenses: db.expenses.filter(e => new Date(e.date).toDateString() === today).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
            sales: db.sales.filter(s => new Date(s.date).toDateString() === today).reduce((s, x) => s + (parseFloat(x.totalAmount) || 0), 0),
            milling: 0
          },
          monthly: {
            totalExpenses: db.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
            totalSales: db.sales.reduce((s, x) => s + (parseFloat(x.totalAmount) || 0), 0),
            netProfit: 0
          }
        });
      }
      break;
  }
  
  return simulateResponse([]);
};

// API wrapper functions
const apiCall = (method, url, data = null) => handleRequest(url, method, data);

// Paddy Purchase APIs
export const addPaddyPurchase = (data) => apiCall('post', '/paddy', data);
export const getPaddyPurchases = () => apiCall('get', '/paddy');
export const getPaddyPurchasesByDate = () => apiCall('get', '/paddy');
export const updatePaddyPurchase = () => Promise.resolve({ data: { success: true } });
export const deletePaddyPurchase = () => Promise.resolve({ data: { success: true } });

// Milling APIs
export const createMilling = (data) => apiCall('post', '/milling', data);
export const processMilling = (data) => apiCall('post', '/milling', data);
export const getMillingProcesses = () => apiCall('get', '/milling');
export const getMillingByDate = () => apiCall('get', '/milling');
export const updateMilling = () => Promise.resolve({ data: { success: true } });
export const deleteMilling = () => Promise.resolve({ data: { success: true } });

// Stock APIs
export const getStock = () => apiCall('get', '/stock');
export const updateStock = () => Promise.resolve({ data: { success: true } });
export const resetAllData = () => apiCall('post', '/stock/reset-all');

// Worker APIs
export const addWorker = (data) => apiCall('post', '/workers', data);
export const getWorkers = () => apiCall('get', '/workers');
export const getWorkerById = () => Promise.resolve({ data: { success: true, data: {} } });
export const addWorkerPayment = () => Promise.resolve({ data: { success: true } });
export const deleteWorker = () => Promise.resolve({ data: { success: true } });

// Expense APIs
export const addExpense = (data) => apiCall('post', '/expenses', data);
export const getExpenses = () => apiCall('get', '/expenses');
export const getExpensesByDate = () => apiCall('get', '/expenses');
export const getDailyExpenses = () => apiCall('get', '/expenses');
export const getMonthlyExpenses = () => apiCall('get', '/expenses');
export const updateExpense = () => Promise.resolve({ data: { success: true } });
export const deleteExpense = () => Promise.resolve({ data: { success: true } });

// Sales APIs
export const addSale = (data) => apiCall('post', '/sales', data);
export const getSales = () => apiCall('get', '/sales');
export const getSalesByDate = () => apiCall('get', '/sales');
export const getDailySales = () => apiCall('get', '/sales');
export const getMonthlySales = () => apiCall('get', '/sales');
export const updateSale = () => Promise.resolve({ data: { success: true } });
export const deleteSale = () => Promise.resolve({ data: { success: true } });

// Report APIs
export const getDailyReport = () => apiCall('get', '/reports/daily');
export const getMonthlyReport = () => apiCall('get', '/reports/monthly');
export const getDashboardSummary = () => apiCall('get', '/reports/dashboard');

export default { get: () => {}, post: () => {}, put: () => {}, delete: () => {} };
