import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary, getStock, getErrorMessage, resetAllData } from '../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const quickActions = [
    { path: '/paddy-entry', label: 'Add Paddy', icon: '🌾', color: 'bg-green-500', hover: 'hover:bg-green-600' },
    { path: '/milling-entry', label: 'Milling', icon: '⚙️', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { path: '/expense-entry', label: 'Expense', icon: '💸', color: 'bg-red-500', hover: 'hover:bg-red-600' },
    { path: '/worker-entry', label: 'Worker', icon: '👷', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    { path: '/sales-entry', label: 'Sales', icon: '💰', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  ];

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Always stop loading first to prevent stuck loading screen
    setLoading(false);
    
    // Try to use cache first for instant loading
    try {
      const cachedData = localStorage.getItem('dashboardCache');
      const cachedTime = localStorage.getItem('dashboardCacheTime');
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setSummary(parsed.summary);
        setStock(parsed.stock);
        if (cachedTime) {
          setLastUpdated(new Date(parseInt(cachedTime)));
        }
        
        // If cache is fresh and not forcing refresh, skip API call
        if (!forceRefresh && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < CACHE_DURATION) {
            return;
          }
        }
      }
    } catch (e) {
      console.error('Cache error:', e);
    }

    // Fetch fresh data in background
    try {
      setError(null);
      
      const [summaryRes, stockRes] = await Promise.all([
        getDashboardSummary(),
        getStock()
      ]);
      
      const summaryData = summaryRes.data?.data || {};
      const stockData = stockRes.data?.data || {};
      
      setSummary(summaryData);
      setStock(stockData);
      setLastUpdated(new Date());
      
      // Update cache
      localStorage.setItem('dashboardCache', JSON.stringify({
        summary: summaryData,
        stock: stockData
      }));
      localStorage.setItem('dashboardCacheTime', Date.now().toString());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch latest data. Showing cached data.');
      // Silent fail - already showing cached data or empty state
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchData(true);
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to delete ALL data?\n\nThis will delete:\n• All Paddy purchases\n• All Milling entries\n• All Expenses\n• All Workers\n• All Sales\n• All Stock\n\nThis action cannot be undone!')) {
      return;
    }
    
    try {
      await resetAllData();
      setResetMessage('✅ All data deleted successfully');
      // Clear cache and refresh
      localStorage.removeItem('dashboardCache');
      localStorage.removeItem('dashboardCacheTime');
      fetchData(true);
      setTimeout(() => setResetMessage(''), 3000);
    } catch (error) {
      setResetMessage(`❌ ${getErrorMessage(error)}`);
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const stockData = stock || summary?.stock || {};
  const today = summary?.today || {};
  const monthly = summary?.monthly || {};

  return (
    <div className="space-y-6">
      {/* Quick Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-full bg-white rounded-lg shadow p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold text-gray-800">Quick Actions</span>
          </div>
          <span className={`text-2xl transition-transform duration-200 ${showQuickActions ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showQuickActions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-10 overflow-hidden">
            <div className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {quickActions.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowQuickActions(false)}
                  className={`${item.color} ${item.hover} text-white p-3 rounded-lg text-sm font-semibold flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-md`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Paddy Stock</div>
          <div className="text-2xl font-bold text-green-600">
            {stockData.paddy?.quantity || 0} <span className="text-sm">{stockData.paddy?.unit || 'Qu'}</span>
          </div>
          <div className="text-xs text-gray-400">{stockData.paddy?.bags || 0} bags</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Rice Stock</div>
          <div className="text-2xl font-bold text-blue-600">
            {stockData.rice?.quantity || 0} <span className="text-sm">{stockData.rice?.unit || 'Qu'}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Monthly Expenses</div>
          <div className="text-2xl font-bold text-red-600">
            ₹{monthly.totalExpenses?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Monthly Sales</div>
          <div className="text-2xl font-bold text-yellow-600">
            ₹{monthly.totalSales?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 col-span-2 lg:col-span-1">
          <div className="text-sm text-gray-500 mb-1">Net Profit</div>
          <div className={`text-2xl font-bold ${monthly.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{monthly.netProfit?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{today.purchases || 0}</div>
            <div className="text-sm text-gray-600">Purchases</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{today.milling || 0}</div>
            <div className="text-sm text-gray-600">Milling (Qu)</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">₹{today.expenses?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600">Expenses</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">₹{today.sales?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600">Sales</div>
          </div>
        </div>
      </div>

      {/* All Stock Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Bran</span>
            <span className="font-semibold">{stockData.bran?.quantity || 0} {stockData.bran?.unit || 'Qu'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Broken</span>
            <span className="font-semibold">{stockData.broken?.quantity || 0} {stockData.broken?.unit || 'Qu'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Rafi</span>
            <span className="font-semibold">{stockData.rafi?.quantity || 0} {stockData.rafi?.unit || 'Qu'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
            <span className="text-gray-600">Husk</span>
            <span className="font-semibold">{stockData.husk?.quantity || 0} {stockData.husk?.unit || 'Qu'}</span>
          </div>
        </div>
      </div>

      {/* Reset Data Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
        
        {resetMessage && (
          <div className={`p-3 rounded-lg mb-4 ${resetMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {resetMessage}
          </div>
        )}
        
        <button
          onClick={handleResetData}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          <span>Reset All Data</span>
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          This will delete all Paddy, Milling, Expenses, Workers, Sales, and Stock data
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
