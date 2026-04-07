import { useEffect, useState } from 'react';
import { getStock, resetPaddyStock, getErrorMessage } from '../services/api';

const Stock = () => {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await getStock();
      setStock(response.data.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPaddyStock = async () => {
    try {
      setResetting(true);
      await resetPaddyStock();
      setResetMessage('✅ Paddy stock reset to 0 successfully');
      setShowResetModal(false);
      // Refresh stock data
      await fetchStock();
      // Clear message after 3 seconds
      setTimeout(() => setResetMessage(''), 3000);
    } catch (error) {
      setResetMessage(`❌ ${getErrorMessage(error)}`);
      setShowResetModal(false);
      setTimeout(() => setResetMessage(''), 3000);
    } finally {
      setResetting(false);
    }
  };

  const cancelReset = () => {
    setShowResetModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const stockItems = [
    { name: 'Paddy', key: 'paddy', icon: '🌾', color: 'bg-green-100 border-green-300', lowThreshold: 10 },
    { name: 'Rice', key: 'rice', icon: '🍚', color: 'bg-blue-100 border-blue-300', lowThreshold: 5 },
    { name: 'Bran', key: 'bran', icon: '🌾', color: 'bg-yellow-100 border-yellow-300', lowThreshold: 2 },
    { name: 'Broken (Tukda)', key: 'broken', icon: '🍚', color: 'bg-orange-100 border-orange-300', lowThreshold: 2 },
    { name: 'Rafi', key: 'rafi', icon: '🌾', color: 'bg-purple-100 border-purple-300', lowThreshold: 1 },
    { name: 'Husk', key: 'husk', icon: '🌾', color: 'bg-gray-100 border-gray-300', lowThreshold: 5 },
  ];

  const isLowStock = (item) => {
    const quantity = stock?.[item.key]?.quantity || 0;
    return quantity <= item.lowThreshold && quantity > 0;
  };

  const isOutOfStock = (item) => {
    const quantity = stock?.[item.key]?.quantity || 0;
    return quantity === 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Stock Management</h2>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm flex items-center gap-2"
        >
          <span>🔄</span>
          Reset Paddy Stock
        </button>
      </div>

      {/* Success/Error Message */}
      {resetMessage && (
        <div className="bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4">
          <p className="text-sm font-medium text-gray-800">{resetMessage}</p>
        </div>
      )}

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stockItems.map((item) => {
          const itemData = stock?.[item.key] || { quantity: 0, unit: 'Qu', bags: 0 };
          const lowStock = isLowStock(item);
          const outOfStock = isOutOfStock(item);

          return (
            <div
              key={item.key}
              className={`${item.color} border-2 rounded-lg p-4 ${
                lowStock ? 'ring-2 ring-orange-400' : ''
              } ${outOfStock ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    {item.key === 'paddy' && (
                      <p className="text-sm text-gray-600">{itemData.bags || 0} bags</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {itemData.quantity || 0}
                  </div>
                  <div className="text-sm text-gray-600">{itemData.unit || 'Qu'}</div>
                </div>
              </div>

              {/* Stock Status */}
              {lowStock && (
                <div className="mt-2 text-sm text-orange-600 font-medium">
                  ⚠️ Low Stock
                </div>
              )}
              {outOfStock && (
                <div className="mt-2 text-sm text-red-600 font-medium">
                  ❌ Out of Stock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stock Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Stock Status Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>Normal Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-400 ring-2 ring-orange-400 rounded"></div>
            <span>Low Stock Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 opacity-60 rounded"></div>
            <span>Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">⚠️ Reset Paddy Stock?</h3>
              <p className="text-sm text-gray-600 text-center">
                This will set Paddy Stock to 0. This action cannot be undone!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={cancelReset}
                disabled={resetting}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPaddyStock}
                disabled={resetting}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Paddy Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
