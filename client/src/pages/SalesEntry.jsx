import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSale, getStock, getErrorMessage } from '../services/api';

const SalesEntry = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productType: 'Rice',
    quantity: '',
    unit: 'Qu',
    price: '',
    customerName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchStock();
    const pendingData = localStorage.getItem('pendingSale');
    if (pendingData) {
      setMessage('Found unsaved data. Click retry to submit.');
      setMessageType('warning');
      // Don't auto-submit, let user decide
    }
  }, []);

  const fetchStock = async () => {
    try {
      const response = await getStock();
      setStock(response.data.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calculate total amount
      if ((name === 'quantity' || name === 'price') && newData.quantity && newData.price) {
        setTotalAmount(parseFloat(newData.quantity) * parseFloat(newData.price));
      }
      
      return newData;
    });

    if (messageType === 'error') {
      setMessage('');
      setMessageType('');
    }
  };

  const handleSubmit = async (e, pendingData = null) => {
    if (e) e.preventDefault();
    
    const dataToSubmit = pendingData || {
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      totalAmount
    };

    setLoading(true);
    setMessage(pendingData ? 'Retrying connection...' : 'Recording sale, please wait...');
    setMessageType('info');

    try {
      await addSale(dataToSubmit);
      
      localStorage.removeItem('pendingSale');
      
      setMessage('✅ Sale recorded successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      localStorage.setItem('pendingSale', JSON.stringify(dataToSubmit));
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const pendingData = localStorage.getItem('pendingSale');
    if (pendingData) {
      handleSubmit(null, JSON.parse(pendingData));
    }
  };

  const productTypes = ['Rice', 'Bran', 'Broken', 'Rafi', 'Husk'];

  const getAvailableStock = () => {
    if (!stock) return 0;
    const key = formData.productType.toLowerCase();
    return stock[key]?.quantity || 0;
  };

  const getStockUnit = () => {
    if (!stock) return 'Qu';
    const key = formData.productType.toLowerCase();
    return stock[key]?.unit || 'Qu';
  };

  const availableStock = getAvailableStock();
  const stockUnit = getStockUnit();

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Entry</h2>

      {/* Available Stock Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="text-sm text-yellow-600 mb-1">Available {formData.productType} Stock</div>
        <div className="text-2xl font-bold text-yellow-800">
          {availableStock} {stockUnit}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
          messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
          messageType === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
          'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {messageType === 'error' && <span>⚠️</span>}
            {messageType === 'success' && <span>✅</span>}
            {messageType === 'warning' && <span>⏳</span>}
            {messageType === 'info' && <span>🔄</span>}
            <span className="font-medium">{message}</span>
          </div>
          {messageType === 'error' && (
            <button
              onClick={handleRetry}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Click here to retry
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
          <select
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
              min="0"
              max={availableStock}
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="Qu">Quintal (Qu)</option>
              <option value="Ton">Ton</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per {formData.unit} (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Optional)</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter customer name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Total Amount Preview */}
        {totalAmount > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-yellow-700">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || parseFloat(formData.quantity) > availableStock}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Record Sale'}
        </button>

        {parseFloat(formData.quantity) > availableStock && (
          <p className="text-sm text-red-600 text-center">
            Quantity exceeds available stock!
          </p>
        )}
      </form>
    </div>
  );
};

export default SalesEntry;
