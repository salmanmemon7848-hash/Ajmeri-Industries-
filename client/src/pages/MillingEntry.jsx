import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMilling, getMillingProcesses, deleteMilling, getErrorMessage } from '../services/api';

const MillingEntry = () => {
  const navigate = useNavigate();
  const [millingProcesses, setMillingProcesses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'Qu',
    rice: '',
    bran: '',
    broken: '',
    rafi: '',
    husk: ''
  });

  useEffect(() => {
    fetchMillingProcesses();
  }, []);

  const fetchMillingProcesses = async () => {
    try {
      const response = await getMillingProcesses();
      setMillingProcesses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching milling processes:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Saving milling entry...');
    setMessageType('info');

    try {
      await createMilling({
        ...formData,
        quantity: parseFloat(formData.quantity),
        rice: parseFloat(formData.rice) || 0,
        bran: parseFloat(formData.bran) || 0,
        broken: parseFloat(formData.broken) || 0,
        rafi: parseFloat(formData.rafi) || 0,
        husk: parseFloat(formData.husk) || 0
      });

      setMessage('✅ Milling entry saved successfully!');
      setMessageType('success');
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unit: 'Qu',
        rice: '',
        bran: '',
        broken: '',
        rafi: '',
        husk: ''
      });
      
      setShowAddForm(false);
      fetchMillingProcesses();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this milling entry?')) return;
    
    try {
      await deleteMilling(id);
      setMessage('✅ Milling entry deleted successfully!');
      setMessageType('success');
      fetchMillingProcesses();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Milling Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Add Milling Entry
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
          messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
          'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {messageType === 'error' && <span>⚠️</span>}
            {messageType === 'success' && <span>✅</span>}
            {messageType === 'info' && <span>🔄</span>}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Add Milling Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Milling Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="Qu">Quintal (Qu)</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Output Products</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Rice</label>
                    <input
                      type="number"
                      name="rice"
                      value={formData.rice}
                      onChange={handleChange}
                      placeholder="Rice qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Bran</label>
                    <input
                      type="number"
                      name="bran"
                      value={formData.bran}
                      onChange={handleChange}
                      placeholder="Bran qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Broken</label>
                    <input
                      type="number"
                      name="broken"
                      value={formData.broken}
                      onChange={handleChange}
                      placeholder="Broken qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Rafi</label>
                    <input
                      type="number"
                      name="rafi"
                      value={formData.rafi}
                      onChange={handleChange}
                      placeholder="Rafi qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Husk</label>
                    <input
                      type="number"
                      name="husk"
                      value={formData.husk}
                      onChange={handleChange}
                      placeholder="Husk qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milling Processes List */}
      <div className="space-y-4">
        {millingProcesses.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
            No milling entries yet. Click "Add Milling Entry" to create one.
          </div>
        ) : (
          millingProcesses.map((process) => (
            <div key={process._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-gray-800">
                    {new Date(process.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Input: {process.quantityMilled || process.quantity} {process.unit}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(process._id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>

              {/* Output Products */}
              {process.outputs && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-xs text-gray-500">Rice</div>
                    <div className="font-semibold text-blue-600">{process.outputs.rice?.quantity || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-xs text-gray-500">Bran</div>
                    <div className="font-semibold text-yellow-600">{process.outputs.bran?.quantity || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-xs text-gray-500">Broken</div>
                    <div className="font-semibold text-orange-600">{process.outputs.broken?.quantity || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-xs text-gray-500">Rafi</div>
                    <div className="font-semibold text-purple-600">{process.outputs.rafi?.quantity || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Husk</div>
                    <div className="font-semibold text-gray-600">{process.outputs.husk?.quantity || 0}</div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MillingEntry;
