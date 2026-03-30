import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSale, getStock, getErrorMessage } from '../services/api';
import { generateSalesPDF } from '../utils/pdfGenerator';

const SalesEntry = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product: 'Rice',
    quantity: '',
    unit: 'Qu',
    rate: '',
    buyerName: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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
      if ((name === 'quantity' || name === 'rate') && newData.quantity && newData.rate) {
        setTotalAmount(parseFloat(newData.quantity) * parseFloat(newData.rate));
      }
      
      return newData;
    });

    if (messageType === 'error') {
      setMessage('');
      setMessageType('');
    }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.buyerName || !formData.quantity || !formData.rate) {
      setMessage('❌ Please fill all required fields');
      setMessageType('error');
      return;
    }
    if (parseFloat(formData.quantity) > availableStock) {
      setMessage('❌ Quantity exceeds available stock!');
      setMessageType('error');
      return;
    }
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    const doc = generateSalesPDF({
      ...formData,
      totalAmount
    });
    doc.save(`Sales_Entry_${formData.date}.pdf`);
  };

  const handleConfirmSave = async () => {
    const dataToSubmit = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.rate),
      totalAmount
    };

    setLoading(true);
    setMessage('Recording sale, please wait...');
    setMessageType('info');

    try {
      await addSale(dataToSubmit);
      
      localStorage.removeItem('pendingSale');
      
      setMessage('✅ Sale recorded successfully!');
      setMessageType('success');
      setShowPreview(false);
      
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
    const key = formData.product.toLowerCase();
    return stock[key]?.quantity || 0;
  };

  const getStockUnit = () => {
    if (!stock) return 'Qu';
    const key = formData.product.toLowerCase();
    return stock[key]?.unit || 'Qu';
  };

  const availableStock = getAvailableStock();
  const stockUnit = getStockUnit();

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Entry</h2>

      {/* Available Stock Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="text-sm text-yellow-600 mb-1">Available {formData.product} Stock</div>
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

      <form className="bg-white rounded-lg shadow p-6 space-y-4">
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
            name="product"
            value={formData.product}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate per {formData.unit} (₹)</label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            placeholder="Enter rate"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
          <input
            type="text"
            name="buyerName"
            value={formData.buyerName}
            onChange={handleChange}
            placeholder="Enter buyer name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter notes or remarks"
            rows="3"
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
          type="button"
          onClick={handlePreview}
          disabled={loading || parseFloat(formData.quantity) > availableStock}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Preview Entry
        </button>

        {parseFloat(formData.quantity) > availableStock && (
          <p className="text-sm text-red-600 text-center">
            Quantity exceeds available stock!
          </p>
        )}
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Preview Sales Entry</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Buyer:</span>
                <span className="font-medium">{formData.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{formData.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{formData.quantity} {formData.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rate:</span>
                <span className="font-medium">₹{formData.rate}/{formData.unit}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-800 font-medium">Total Amount:</span>
                <span className="font-bold text-yellow-700">₹{totalAmount.toLocaleString()}</span>
              </div>
              {formData.description && (
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{formData.description}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              
              <button
                onClick={handleConfirmSave}
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Confirm & Save'}
              </button>
              
              <button
                onClick={() => setShowPreview(false)}
                disabled={loading}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Edit Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEntry;
