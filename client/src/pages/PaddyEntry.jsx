import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPaddyPurchase, getPaddyPurchases, deletePaddyPurchase, getErrorMessage } from '../services/api';
import { generatePaddyPDF } from '../utils/pdfGenerator';

const PaddyEntry = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    newBags: '',
    oldBags: '',
    riceMillHamali: '',
    warehouseHamali: '',
    description: ''
  });

  // Calculate total hamali
  const totalHamali = (parseFloat(formData.riceMillHamali) || 0) + (parseFloat(formData.warehouseHamali) || 0);

  // Calculate total bags
  const totalBags = (parseFloat(formData.newBags) || 0) + (parseFloat(formData.oldBags) || 0);

  // Calculate total quintal (Total Bags ÷ 2.5)
  const totalQuintal = totalBags > 0 ? (totalBags / 2.5).toFixed(2) : '0.00';

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await getPaddyPurchases();
      setEntries(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

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

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: '',
      newBags: '',
      oldBags: '',
      riceMillHamali: '',
      warehouseHamali: '',
      description: ''
    });
    setEditingId(null);
  };

  const handlePreview = (e) => {
    e.preventDefault();
    
    if (!formData.newBags && !formData.oldBags) {
      setMessage('❌ Please enter at least New or Old bags');
      setMessageType('error');
      return;
    }
    
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    const doc = generatePaddyPDF({
      ...formData,
      farmerName: formData.source,
      newQuantity: formData.newBags,
      oldQuantity: formData.oldBags
    });
    doc.save(`Paddy_Entry_${formData.date}.pdf`);
  };

  const handleConfirmSave = async () => {
    const dataToSubmit = {
      date: formData.date,
      farmerName: formData.source,
      newQuantity: parseFloat(formData.newBags) || 0,
      oldQuantity: parseFloat(formData.oldBags) || 0,
      totalQuantity: totalBags,
      totalQuintal: parseFloat(totalQuintal),
      riceMillHamali: parseFloat(formData.riceMillHamali) || 0,
      warehouseHamali: parseFloat(formData.warehouseHamali) || 0,
      totalHamali: totalHamali,
      description: formData.description
    };

    setLoading(true);
    setMessage(editingId ? 'Updating...' : 'Saving...');
    setMessageType('info');

    try {
      await addPaddyPurchase(dataToSubmit);
      setShowPreview(false);
      setMessage(editingId ? '✅ Updated successfully!' : '✅ Saved successfully!');
      setMessageType('success');
      resetForm();
      fetchEntries();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(`❌ ${getErrorMessage(error)}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      date: entry.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      source: entry.farmerName || '',
      newBags: entry.newQuantity || '',
      oldBags: entry.oldQuantity || '',
      riceMillHamali: entry.riceMillHamali || '',
      warehouseHamali: entry.warehouseHamali || '',
      totalAmount: entry.totalAmount || ''
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await deletePaddyPurchase(id);
      setMessage('✅ Deleted successfully!');
      setMessageType('success');
      fetchEntries();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(`❌ ${getErrorMessage(error)}`);
      setMessageType('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {editingId ? 'Edit Government Paddy Entry' : 'Add Government Paddy Purchase'}
        </h2>

        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            messageType === 'error' ? 'bg-red-100 text-red-700' :
            messageType === 'success' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handlePreview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Enter source name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* New + Old Bags Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Bags (Bag) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="newBags"
                value={formData.newBags}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Old Bags (Bag) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="oldBags"
                value={formData.oldBags}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Bags</label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-bold text-green-700">
                {totalBags.toFixed(2)} Bag
              </div>
            </div>
          </div>

          {/* Dual Hamali Fields */}
          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Samiti + Warehouse Hamali (₹)</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Hamali (₹)</label>
              <div className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg font-bold text-blue-700">
                ₹{totalHamali.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Total Quintal (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity (Quintal)</label>
            <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg font-bold text-green-700">
              {totalQuintal} Qu
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-calculated: Total Bags ÷ 2.5</p>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter any notes or remarks"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400"
            >
              Preview Entry
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Preview Entry</h3>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Source:</span>
                <span className="font-medium">{formData.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Bags:</span>
                <span className="font-medium">{formData.newBags || 0} Bag</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Old Bags:</span>
                <span className="font-medium">{formData.oldBags || 0} Bag</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-medium">Total Bags:</span>
                <span className="font-bold text-green-700">{totalBags.toFixed(2)} Bag</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-medium">Total Quintal:</span>
                <span className="font-bold text-green-700">{totalQuintal} Qu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rice Mill Hamali:</span>
                <span className="font-medium">₹{formData.riceMillHamali || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warehouse Hamali:</span>
                <span className="font-medium">₹{formData.warehouseHamali || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-medium">Total Hamali:</span>
                <span className="font-bold text-blue-700">₹{totalHamali.toFixed(2)}</span>
              </div>
              {formData.description && (
                <div className="border-t pt-2">
                  <span className="text-gray-600 block mb-1">Description:</span>
                  <span className="text-sm text-gray-700">{formData.description}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Edit Back
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Download PDF
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Paddy Entries</h3>
        
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No entries found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Farmer</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">New</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Old</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm">{entry.farmerName}</td>
                    <td className="px-4 py-2 text-sm text-right">{entry.newQuantity || 0}</td>
                    <td className="px-4 py-2 text-sm text-right">{entry.oldQuantity || 0}</td>
                    <td className="px-4 py-2 text-sm text-right font-bold">
                      {(parseFloat(entry.newQuantity) + parseFloat(entry.oldQuantity)).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaddyEntry;
