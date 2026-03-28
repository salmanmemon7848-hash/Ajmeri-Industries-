import { useEffect, useState } from 'react';
import { getStock } from '../services/api';

const Stock = () => {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-xl font-bold text-gray-800">Stock Management</h2>

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
    </div>
  );
};

export default Stock;
