import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addExpense, getErrorMessage } from '../services/api';

const ExpenseEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Transport',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const expenseCategories = [
    'Transport',
    'Hamali',
    'Salary',
    'Electricity',
    'Office',
    'Other'
  ];

  useEffect(() => {
    // Check for pending data in localStorage
    const pendingData = localStorage.getItem('pendingExpense');
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
    // Clear error when user starts typing
    if (messageType === 'error') {
      setMessage('');
      setMessageType('');
    }
  };

  const handleSubmit = async (e, pendingData = null) => {
    if (e) e.preventDefault();
    
    const dataToSubmit = pendingData || {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    setLoading(true);
    setMessage(pendingData ? 'Retrying connection...' : 'Saving data, please wait...');
    setMessageType('info');

    try {
      await addExpense(dataToSubmit);
      
      // Clear pending data if exists
      localStorage.removeItem('pendingExpense');
      
      setMessage('✅ Expense saved successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      
      // Store data for retry
      localStorage.setItem('pendingExpense', JSON.stringify(dataToSubmit));
      
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const pendingData = localStorage.getItem('pendingExpense');
    if (pendingData) {
      handleSubmit(null, JSON.parse(pendingData));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Add Expense</h2>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description (optional)"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseEntry;
