 import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPaddyPurchase, getErrorMessage } from '../services/api';

const PaddyEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bags: '',
    bagType: 'New',
    source: '',
    hamali: '',
    quantity: '',
    unit: 'Qu'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  useEffect(() => {
    const pendingData = localStorage.getItem('pendingPaddy');
    if (pendingData) {
      setMessage('Found unsaved data. Click retry to submit.');
      setMessageType('warning');
      // Don't auto-submit, let user decide
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (messageType === 'error') {
      setMessage('');
      setMessageType('');
    }
  };

  const handleSubmit = async (e, pendingData = null) => {
    if (e) e.preventDefault();
    
    const dataToSubmit = pendingData || {
      ...formData,
      bags: parseInt(formData.bags),
      hamali: parseFloat(formData.hamali) || 0,
      quantity: parseFloat(formData.quantity)
    };

    setLoading(true);
    setMessage(pendingData ? 'Retrying connection...' : 'Saving data, please wait...');
    setMessageType('info');

    try {
      await addPaddyPurchase(dataToSubmit);
      
      localStorage.removeItem('pendingPaddy');
      
      setMessage('✅ Paddy purchase saved successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      localStorage.setItem('pendingPaddy', JSON.stringify(dataToSubmit));
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const pendingData = localStorage.getItem('pendingPaddy');
    if (pendingData) {
      handleSubmit(null, JSON.parse(pendingData));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Add Paddy Purchase</h2>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bags</label>
            <input
              type="number"
              name="bags"
              value={formData.bags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bag Type</label>
            <select
              name="bagType"
              value={formData.bagType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="New">New</option>
              <option value="Old">Old</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source (Mandi/Supplier)</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="Enter source name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hamali (Labour Cost)</label>
          <input
            type="number"
            name="hamali"
            value={formData.hamali}
            onChange={handleChange}
            placeholder="Enter hamali amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            min="0"
          />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="Qu">Quintal (Qu)</option>
              <option value="Ton">Ton</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Add Purchase'}
        </button>
      </form>
    </div>
  );
};

export default PaddyEntry;
