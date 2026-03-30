import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addPurchase, getErrorMessage } from '../services/api';
import { generatePurchasePDF } from '../utils/pdfGenerator';

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'paddy';
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    quantity: '',
    rate: '',
    riceMillHamali: '',
    warehouseHamali: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Calculate total amount
  const totalAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.rate) || 0);
  const totalHamali = (parseFloat(formData.riceMillHamali) || 0) + (parseFloat(formData.warehouseHamali) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (messageType === 'error') {
      setMessage('');
      setMessageType('');
    }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.supplierName || !formData.quantity || !formData.rate) {
      setMessage('❌ Please fill all required fields');
      setMessageType('error');
      return;
    }
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    const doc = generatePurchasePDF({
      ...formData,
      totalAmount
    }, type);
    doc.save(`${type === 'paddy' ? 'Paddy' : 'Rice'}_Purchase_${formData.date}.pdf`);
  };

  const handleConfirmSave = async () => {
    const dataToSubmit = {
      type: type,
      date: formData.date,
      supplierName: formData.supplierName,
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.rate),
      totalAmount: totalAmount,
      riceMillHamali: type === 'paddy' ? parseFloat(formData.riceMillHamali) || 0 : 0,
      warehouseHamali: type === 'paddy' ? parseFloat(formData.warehouseHamali) || 0 : 0,
      totalHamali: type === 'paddy' ? totalHamali : 0,
      notes: formData.notes
    };

    setLoading(true);
    setMessage('Saving purchase...');
    setMessageType('info');

    try {
      await addPurchase(dataToSubmit);
      setMessage(`✅ ${type === 'paddy' ? 'Paddy' : 'Rice'} purchase saved successfully!`);
      setMessageType('success');
      setShowPreview(false);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setMessage(`❌ ${getErrorMessage(error)}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const isPaddy = type === 'paddy';

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Purchase {isPaddy ? 'Paddy' : 'Rice'}
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          messageType === 'error' ? 'bg-red-100 text-red-700' :
          messageType === 'success' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            placeholder="Enter supplier name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Qu)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹/Qu)</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Auto-calculated Total Amount */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <label className="block text-sm font-medium text-green-800 mb-1">Total Amount (Auto)</label>
          <div className="text-2xl font-bold text-green-700">
            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Hamali fields - only for Paddy */}
        {isPaddy && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-gray-700">Hamali Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rice Mill Hamali (₹)</label>
                <input
                  type="number"
                  name="riceMillHamali"
                  value={formData.riceMillHamali}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Samiti + Warehouse (₹)</label>
                <input
                  type="number"
                  name="warehouseHamali"
                  value={formData.warehouseHamali}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <span className="text-sm text-blue-700">Total Hamali: </span>
              <span className="font-bold text-blue-800">₹{totalHamali.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any notes"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400"
        >
          Preview Entry
        </button>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Preview {isPaddy ? 'Paddy' : 'Rice'} Purchase</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supplier:</span>
                <span className="font-medium">{formData.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{formData.quantity} Qu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rate:</span>
                <span className="font-medium">₹{formData.rate}/Qu</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-800 font-medium">Total Amount:</span>
                <span className="font-bold text-green-700">₹{totalAmount.toLocaleString()}</span>
              </div>
              {isPaddy && (
                <>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Rice Mill Hamali:</span>
                    <span className="font-medium">₹{formData.riceMillHamali || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warehouse Hamali:</span>
                    <span className="font-medium">₹{formData.warehouseHamali || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hamali:</span>
                    <span className="font-medium">₹{totalHamali.toFixed(2)}</span>
                  </div>
                </>
              )}
              {formData.notes && (
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Notes:</span>
                  <span className="font-medium">{formData.notes}</span>
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

export default PurchaseEntry;
