const { Worker } = require('../models');

// Helper to calculate total paid
const calculateTotalPaid = (payments) => {
  return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
};

// Add new worker
exports.addWorker = async (req, res) => {
  try {
    const { name, role } = req.body;
    
    if (global.memoryDB) {
      const worker = {
        _id: Date.now().toString(),
        name,
        role,
        payments: [],
        createdAt: new Date()
      };
      global.memoryDB.workers.push(worker);
      return res.status(201).json({ success: true, data: { ...worker, totalPaid: 0 } });
    }
    
    const worker = new Worker({ name, role, payments: [] });
    await worker.save();
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all workers
exports.getWorkers = async (req, res) => {
  try {
    if (global.memoryDB) {
      const workersWithTotal = global.memoryDB.workers.map(worker => ({
        ...worker,
        totalPaid: calculateTotalPaid(worker.payments)
      }));
      return res.status(200).json({ success: true, data: workersWithTotal });
    }
    
    const workers = await Worker.find().sort({ createdAt: -1 });
    
    // Calculate total paid for each worker
    const workersWithTotal = workers.map(worker => {
      const totalPaid = worker.payments.reduce((sum, payment) => sum + payment.amount, 0);
      return {
        ...worker.toObject(),
        totalPaid
      };
    });
    
    res.status(200).json({ success: true, data: workersWithTotal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single worker with payment history
exports.getWorkerById = async (req, res) => {
  try {
    if (global.memoryDB) {
      const worker = global.memoryDB.workers.find(w => w._id === req.params.id);
      if (!worker) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      const totalPaid = calculateTotalPaid(worker.payments);
      return res.status(200).json({ success: true, data: { ...worker, totalPaid } });
    }
    
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    
    const totalPaid = worker.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...worker.toObject(),
        totalPaid
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add payment to worker
exports.addPayment = async (req, res) => {
  try {
    const { date, amount, type } = req.body;
    
    if (global.memoryDB) {
      const worker = global.memoryDB.workers.find(w => w._id === req.params.id);
      if (!worker) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      
      worker.payments.push({
        date: date || new Date(),
        amount: parseFloat(amount),
        type
      });
      
      const totalPaid = calculateTotalPaid(worker.payments);
      return res.status(200).json({ success: true, data: { ...worker, totalPaid } });
    }
    
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    
    worker.payments.push({
      date: date || new Date(),
      amount,
      type
    });
    
    await worker.save();
    
    const totalPaid = worker.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...worker.toObject(),
        totalPaid
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete worker
exports.deleteWorker = async (req, res) => {
  try {
    if (global.memoryDB) {
      const index = global.memoryDB.workers.findIndex(w => w._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      global.memoryDB.workers.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Worker deleted successfully' });
    }
    
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.status(200).json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
