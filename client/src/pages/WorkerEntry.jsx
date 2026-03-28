import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWorker, getWorkers, addWorkerPayment, deleteWorker, getErrorMessage } from '../services/api';

const WorkerEntry = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const [workerForm, setWorkerForm] = useState({
    name: '',
    role: 'Labour'
  });

  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'Full'
  });

  useEffect(() => {
    fetchWorkers();
    // Check for pending data
    const pendingWorker = localStorage.getItem('pendingWorker');
    const pendingPayment = localStorage.getItem('pendingWorkerPayment');
    if (pendingWorker) {
      setMessage('Found unsaved worker data. Click retry to submit.');
      setMessageType('warning');
      // Don't auto-submit, let user decide
    } else if (pendingPayment) {
      setMessage('Found unsaved payment data. Click retry to submit.');
      setMessageType('warning');
      // Don't auto-submit, let user decide
    }
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await getWorkers();
      setWorkers(response.data.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleAddWorker = async (e, pendingData = null) => {
    if (e) e.preventDefault();
    const dataToSubmit = pendingData || workerForm;
    
    setLoading(true);
    setMessage(pendingData ? 'Retrying connection...' : 'Saving worker, please wait...');
    setMessageType('info');
    
    try {
      await addWorker(dataToSubmit);
      localStorage.removeItem('pendingWorker');
      setMessage('✅ Worker added successfully!');
      setMessageType('success');
      setWorkerForm({ name: '', role: 'Labour' });
      setShowAddWorker(false);
      fetchWorkers();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      localStorage.setItem('pendingWorker', JSON.stringify(dataToSubmit));
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e, workerId = null, pendingData = null) => {
    if (e) e.preventDefault();
    const targetWorkerId = workerId || showAddPayment;
    const dataToSubmit = pendingData || {
      ...paymentForm,
      amount: parseFloat(paymentForm.amount)
    };
    
    setLoading(true);
    setMessage(pendingData ? 'Retrying connection...' : 'Saving payment, please wait...');
    setMessageType('info');
    
    try {
      await addWorkerPayment(targetWorkerId, dataToSubmit);
      localStorage.removeItem('pendingWorkerPayment');
      setMessage('✅ Payment added successfully!');
      setMessageType('success');
      setPaymentForm({ date: new Date().toISOString().split('T')[0], amount: '', type: 'Full' });
      setShowAddPayment(null);
      fetchWorkers();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      localStorage.setItem('pendingWorkerPayment', JSON.stringify({ id: targetWorkerId, data: dataToSubmit }));
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const pendingWorker = localStorage.getItem('pendingWorker');
    const pendingPayment = localStorage.getItem('pendingWorkerPayment');
    if (pendingWorker) {
      handleAddWorker(null, JSON.parse(pendingWorker));
    } else if (pendingPayment) {
      const paymentData = JSON.parse(pendingPayment);
      handleAddPayment(null, paymentData.id, paymentData.data);
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    try {
      await deleteWorker(id);
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Worker Management</h2>
        <button
          onClick={() => setShowAddWorker(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
        >
          + Add Worker
        </button>
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

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Worker</h3>
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({...workerForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm({...workerForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="Labour">Labour</option>
                  <option value="Driver">Driver</option>
                  <option value="Helper">Helper</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorker(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-500 text-white py-2 rounded-lg"
                >
                  {loading ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="Advance">Advance</option>
                  <option value="Full">Full Payment</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-500 text-white py-2 rounded-lg"
                >
                  {loading ? 'Saving...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workers List */}
      <div className="space-y-4">
        {workers.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No workers added yet</div>
        ) : (
          workers.map((worker) => (
            <div key={worker._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{worker.name}</h3>
                  <span className="text-sm text-gray-500">{worker.role}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">₹{worker.totalPaid || 0}</div>
                  <div className="text-xs text-gray-500">Total Paid</div>
                </div>
              </div>

              {/* Payment History */}
              {worker.payments && worker.payments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment History</h4>
                  <div className="space-y-1">
                    {worker.payments.slice(-3).map((payment, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(payment.date).toLocaleDateString()} - {payment.type}
                        </span>
                        <span className="font-medium">₹{payment.amount}</span>
                      </div>
                    ))}
                    {worker.payments.length > 3 && (
                      <div className="text-xs text-gray-500">+ {worker.payments.length - 3} more payments</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowAddPayment(worker._id)}
                  className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg text-sm hover:bg-purple-200"
                >
                  Add Payment
                </button>
                <button
                  onClick={() => handleDeleteWorker(worker._id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerEntry;
