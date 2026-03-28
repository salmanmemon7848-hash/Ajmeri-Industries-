import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPaddyPurchase, getPaddyPurchases, deletePaddyPurchase, getErrorMessage } from '../services/api';

const PaddyEntry = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    farmerName: '',
    newQuantity: '',
    oldQuantity: '',
    riceMillHamali: '',
    warehouseHamali: '',
    totalAmount: ''
  });

  // Calculate total hamali
  const totalHamali = (parseFloat(formData.riceMillHamali) || 0) + (parseFloat(formData.warehouseHamali) || 0);

  // Calculate total paddy
  const totalPaddy = (parseFloat(formData.newQuantity) || 0) + (parseFloat(formData.oldQuantity) || 0);

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
      farmerName: '',
      newQuantity: '',
      oldQuantity: '',
      riceMillHamali: '',
      warehouseHamali: '',
      totalAmount: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newQuantity && !formData.oldQuantity) {
      setMessage('❌ Please enter at least New or Old quantity');
      setMessageType('error');
      return;
    }

    const dataToSubmit = {
      date: formData.date,
      farmerName: formData.farmerName,
      newQuantity: parseFloat(formData.newQuantity) || 0,
      oldQuantity: parseFloat(formData.oldQuantity) || 0,
      totalQuantity: totalPaddy,
      riceMillHamali: parseFloat(formData.riceMillHamali) || 0,
      warehouseHamali: parseFloat(formData.warehouseHamali) || 0,
      totalHamali: totalHamali,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      bags: Math.ceil(totalPaddy / 5),
      bagType: 'Mixed'
    };

    setLoading(true);
    setMessage(editingId ? 'Updating...' : 'Saving...');
    setMessageType('info');

    try {
      await addPaddyPurchase(dataToSubmit);
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
      farmerName: entry.farmerName || '',
      newQuantity: entry.newQuantity || '',
      oldQuantity: entry.oldQuantity || '',
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
          {editingId ? 'Edit Paddy Entry' : 'Add Paddy Purchase'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleChange}
                placeholder="Enter farmer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* New + Old Quantity Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Paddy (Qu) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="newQuantity"
                value={formData.newQuantity}
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
                Old Paddy (Qu) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="oldQuantity"
                value={formData.oldQuantity}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Paddy</label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-bold text-green-700">
                {totalPaddy.toFixed(2)} Qu
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="Enter total amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              min="0"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Entry' : 'Add Purchase')}
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
