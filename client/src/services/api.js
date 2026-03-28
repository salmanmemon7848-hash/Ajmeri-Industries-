import axios from 'axios';

// Check if we're in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined';
};

// Server config (for web/mobile mode)
const SERVER_IP = '10.173.156.168';
const API_URL = `http://${SERVER_IP}:5000/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

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

// Local storage for browser/Electron fallback
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

// Helper function to get user-friendly error message
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Server is taking too long to respond.';
  }
  
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Cannot connect to server. Please check if server is running.';
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.status === 404) {
    return 'API endpoint not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again.';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Local data operations
const localDB = {
  getData: () => {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.getData();
    }
    return Promise.resolve(getLocalData());
  },
  
  saveData: (data) => {
    if (isElectron() && window.electronAPI) {
      return window.electronAPI.saveData(data);
    }
    saveLocalData(data);
    return Promise.resolve(true);
  },
  
  simulateResponse: (data) => ({ data: { success: true, data } })
};

// API call - always use local storage (no server needed for Vercel)
const apiCall = async (method, url, data = null) => {
  // Always use local storage - works offline and on Vercel
  return handleLocalRequest(url, method, data);
};

// Handle requests locally
const handleLocalRequest = async (url, method, data) => {
  const db = await localDB.getData();
  const id = generateId();
  const now = new Date().toISOString();
  
  switch (url) {
    case '/paddy':
      if (method === 'get') {
        return localDB.simulateResponse(db.paddyPurchases);
      } else if (method === 'post') {
        const item = { _id: id, ...data, date: data.date || now };
        db.paddyPurchases.push(item);
        db.stock.paddy.quantity += parseFloat(data.quantity) || 0;
        db.stock.paddy.bags += parseInt(data.bags) || 0;
        await localDB.saveData(db);
        return localDB.simulateResponse(item);
      }
      break;
      
    case '/milling':
      if (method === 'get') {
        return localDB.simulateResponse(db.millingProcesses);
      } else if (method === 'post') {
        const item = { 
          _id: id, ...data, date: data.date || now,
          quantityMilled: parseFloat(data.quantity),
          outputs: {
            rice: { quantity: parseFloat(data.rice) || 0, unit: data.unit },
            bran: { quantity: parseFloat(data.bran) || 0, unit: data.unit },
            broken: { quantity: parseFloat(data.broken) || 0, unit: data.unit },
            rafi: { quantity: parseFloat(data.rafi) || 0, unit: data.unit },
            husk: { quantity: parseFloat(data.husk) || 0, unit: data.unit }
          }
        };
        db.millingProcesses.push(item);
        db.stock.paddy.quantity -= parseFloat(data.quantity) || 0;
        db.stock.rice.quantity += parseFloat(data.rice) || 0;
        db.stock.bran.quantity += parseFloat(data.bran) || 0;
        db.stock.broken.quantity += parseFloat(data.broken) || 0;
        db.stock.rafi.quantity += parseFloat(data.rafi) || 0;
        db.stock.husk.quantity += parseFloat(data.husk) || 0;
        await localDB.saveData(db);
        return localDB.simulateResponse(item);
      }
      break;
      
    case '/expenses':
      if (method === 'get') {
        return localDB.simulateResponse(db.expenses);
      } else if (method === 'post') {
        const item = { _id: id, ...data, date: data.date || now };
        db.expenses.push(item);
        await localDB.saveData(db);
        return localDB.simulateResponse(item);
      }
      break;
      
    case '/workers':
      if (method === 'get') {
        return localDB.simulateResponse(db.workers);
      } else if (method === 'post') {
        const item = { _id: id, ...data, payments: [] };
        db.workers.push(item);
        await localDB.saveData(db);
        return localDB.simulateResponse(item);
      }
      break;
      
    case '/sales':
      if (method === 'get') {
        return localDB.simulateResponse(db.sales);
      } else if (method === 'post') {
        const item = { _id: id, ...data, date: data.date || now };
        db.sales.push(item);
        const product = data.product?.toLowerCase();
        if (product && db.stock[product]) {
          db.stock[product].quantity -= parseFloat(data.quantity) || 0;
        }
        await localDB.saveData(db);
        return localDB.simulateResponse(item);
      }
      break;
      
    case '/stock':
      if (method === 'get') {
        return localDB.simulateResponse(db.stock);
      }
      break;
      
    case '/stock/reset-all':
      if (method === 'post') {
        const emptyDB = {
          paddyPurchases: [], millingProcesses: [], expenses: [], workers: [], sales: [],
          stock: { paddy: { quantity: 0, unit: 'Qu', bags: 0 }, rice: { quantity: 0, unit: 'Qu' }, bran: { quantity: 0, unit: 'Qu' }, broken: { quantity: 0, unit: 'Qu' }, rafi: { quantity: 0, unit: 'Qu' }, husk: { quantity: 0, unit: 'Qu' }}
        };
        await localDB.saveData(emptyDB);
        return localDB.simulateResponse({ message: 'All data reset' });
      }
      break;
      
    case '/reports/dashboard':
      if (method === 'get') {
        const today = new Date().toDateString();
        return localDB.simulateResponse({
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
  
  return localDB.simulateResponse([]);
};

// Paddy Purchase APIs
export const addPaddyPurchase = (data) => apiCall('post', '/paddy', data);
export const getPaddyPurchases = () => apiCall('get', '/paddy');
export const getPaddyPurchasesByDate = (startDate, endDate) => apiCall('get', `/paddy/by-date?startDate=${startDate}&endDate=${endDate}`);
export const updatePaddyPurchase = (id, data) => apiCall('put', `/paddy/${id}`, data);
export const deletePaddyPurchase = (id) => apiCall('delete', `/paddy/${id}`);

// Milling APIs
export const createMilling = (data) => apiCall('post', '/milling', data);
export const processMilling = (data) => apiCall('post', '/milling', data);
export const getMillingProcesses = () => apiCall('get', '/milling');
export const getMillingByDate = (startDate, endDate) => apiCall('get', `/milling/by-date?startDate=${startDate}&endDate=${endDate}`);
export const updateMilling = (id, data) => apiCall('put', `/milling/${id}`, data);
export const deleteMilling = (id) => apiCall('delete', `/milling/${id}`);

// Stock APIs
export const getStock = () => apiCall('get', '/stock');
export const updateStock = (data) => apiCall('put', '/stock', data);
export const resetAllData = () => apiCall('post', '/stock/reset-all');

// Worker APIs
export const addWorker = (data) => apiCall('post', '/workers', data);
export const getWorkers = () => apiCall('get', '/workers');
export const getWorkerById = (id) => apiCall('get', `/workers/${id}`);
export const addWorkerPayment = (id, data) => apiCall('post', `/workers/${id}/payment`, data);
export const deleteWorker = (id) => apiCall('delete', `/workers/${id}`);

// Expense APIs
export const addExpense = (data) => apiCall('post', '/expenses', data);
export const getExpenses = () => apiCall('get', '/expenses');
export const getExpensesByDate = (startDate, endDate) => apiCall('get', `/expenses/by-date?startDate=${startDate}&endDate=${endDate}`);
export const getDailyExpenses = () => apiCall('get', '/expenses/daily');
export const getMonthlyExpenses = (year, month) => apiCall('get', `/expenses/monthly?year=${year}&month=${month}`);
export const updateExpense = (id, data) => apiCall('put', `/expenses/${id}`, data);
export const deleteExpense = (id) => apiCall('delete', `/expenses/${id}`);

// Sales APIs
export const addSale = (data) => apiCall('post', '/sales', data);
export const getSales = () => apiCall('get', '/sales');
export const getSalesByDate = (startDate, endDate) => apiCall('get', `/sales/by-date?startDate=${startDate}&endDate=${endDate}`);
export const getDailySales = () => apiCall('get', '/sales/daily');
export const getMonthlySales = (year, month) => apiCall('get', `/sales/monthly?year=${year}&month=${month}`);
export const updateSale = (id, data) => apiCall('put', `/sales/${id}`, data);
export const deleteSale = (id) => apiCall('delete', `/sales/${id}`);

// Report APIs
export const getDailyReport = () => apiCall('get', '/reports/daily');
export const getMonthlyReport = (year, month) => apiCall('get', `/reports/monthly?year=${year}&month=${month}`);
export const getDashboardSummary = () => apiCall('get', '/reports/dashboard');

export default api;
