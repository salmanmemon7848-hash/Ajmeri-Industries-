import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardSummary, getStock, getErrorMessage, resetAllData, getPaddyPurchases, getExpenses, getSales } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const quickActions = [
    { path: '/paddy-entry', label: 'Add Paddy', icon: '🌾', color: 'bg-green-500', hover: 'hover:bg-green-600' },
    { path: '/purchase-entry?type=paddy', label: 'Purchase Paddy', icon: '🛒', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    { path: '/purchase-entry?type=rice', label: 'Purchase Rice', icon: '🍚', color: 'bg-teal-500', hover: 'hover:bg-teal-600' },
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
    
    // Fetch fresh data directly from API (which uses localStorage)
    try {
      setError(null);
      
      const [paddyRes, expensesRes, salesRes, stockRes] = await Promise.all([
        getPaddyPurchases(),
        getExpenses(),
        getSales(),
        getStock()
      ]);
      
      const paddyData = paddyRes.data?.data || [];
      const expensesData = expensesRes.data?.data || [];
      const salesData = salesRes.data?.data || [];
      const stockData = stockRes.data?.data || {};
      
      // Calculate today's data
      const today = new Date().toDateString();
      const todayPurchases = paddyData.filter(p => new Date(p.date).toDateString() === today).length;
      const todayExpenses = expensesData
        .filter(e => new Date(e.date).toDateString() === today)
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const todaySales = salesData
        .filter(s => new Date(s.date).toDateString() === today)
        .reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);
      
      // Calculate monthly data
      const monthlyExpenses = expensesData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const monthlySales = salesData.reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);
      
      const summaryData = {
        today: {
          purchases: todayPurchases,
          expenses: todayExpenses,
          sales: todaySales,
          milling: 0
        },
        monthly: {
          totalExpenses: monthlyExpenses,
          totalSales: monthlySales,
          netProfit: monthlySales - monthlyExpenses
        }
      };
      
      setSummary(summaryData);
      setStock(stockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data.');
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

  const handleResetConfirm = async () => {
    try {
      await resetAllData();
      setResetMessage('✅ All data deleted successfully');
      setShowResetModal(false);
      // Clear cache and refresh
      localStorage.removeItem('dashboardCache');
      localStorage.removeItem('dashboardCacheTime');
      fetchData(true);
      setTimeout(() => setResetMessage(''), 3000);
    } catch (error) {
      setResetMessage(`❌ ${getErrorMessage(error)}`);
      setShowResetModal(false);
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  const handleResetCancel = () => {
    setShowResetModal(false);
    navigate('/');
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
          onClick={() => setShowResetModal(true)}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          <span>Reset All Data</span>
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Click to delete all data
        </p>
      </div>

      {/* Simple Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Reset All Data?</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleResetCancel}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              
              <button
                onClick={handleResetConfirm}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
