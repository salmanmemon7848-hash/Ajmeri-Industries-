const { Stock } = require('../models');

// Default stock structure
const defaultStock = {
  paddy: { quantity: 0, unit: 'Qu', bags: 0 },
  rice: { quantity: 0, unit: 'Qu' },
  bran: { quantity: 0, unit: 'Qu' },
  broken: { quantity: 0, unit: 'Qu' },
  rafi: { quantity: 0, unit: 'Qu' },
  husk: { quantity: 0, unit: 'Qu' }
};

// Get current stock
exports.getStock = async (req, res) => {
  try {
    if (global.memoryDB) {
      return res.status(200).json({ success: true, data: global.memoryDB.stock });
    }
    
    let stock = await Stock.findOne();
    if (!stock) {
      stock = new Stock();
      await stock.save();
    }
    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update stock (for manual adjustments)
exports.updateStock = async (req, res) => {
  try {
    const updates = req.body;
    
    if (global.memoryDB) {
      Object.assign(global.memoryDB.stock, updates);
      return res.status(200).json({ success: true, data: global.memoryDB.stock });
    }
    
    let stock = await Stock.findOne();
    
    if (!stock) {
      stock = new Stock(updates);
    } else {
      Object.assign(stock, updates);
    }
    
    await stock.save();
    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reset stock (use with caution)
exports.resetStock = async (req, res) => {
  try {
    if (global.memoryDB) {
      global.memoryDB.stock = { ...defaultStock };
      return res.status(200).json({ success: true, data: global.memoryDB.stock, message: 'Stock reset successfully' });
    }
    
    await Stock.deleteMany({});
    const stock = new Stock();
    await stock.save();
    res.status(200).json({ success: true, data: stock, message: 'Stock reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reset all data
exports.resetAllData = async (req, res) => {
  try {
    if (global.memoryDB) {
      global.memoryDB.paddyPurchases = [];
      global.memoryDB.millingProcesses = [];
      global.memoryDB.expenses = [];
      global.memoryDB.workers = [];
      global.memoryDB.sales = [];
      global.memoryDB.stock = { ...defaultStock };
      return res.status(200).json({ success: true, message: 'All data deleted successfully' });
    }
    
    // MongoDB mode - delete all collections
    const { PaddyPurchase } = require('../models');
    const { MillingProcess } = require('../models');
    const { Expense } = require('../models');
    const { Worker } = require('../models');
    const { Sale } = require('../models');
    const { Stock } = require('../models');
    
    await PaddyPurchase.deleteMany({});
    await MillingProcess.deleteMany({});
    await Expense.deleteMany({});
    await Worker.deleteMany({});
    await Sale.deleteMany({});
    await Stock.deleteMany({});
    
    // Create fresh stock
    const stock = new Stock();
    await stock.save();
    
    res.status(200).json({ success: true, message: 'All data deleted successfully' });
  } catch (error) {
    console.error('Reset all data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
