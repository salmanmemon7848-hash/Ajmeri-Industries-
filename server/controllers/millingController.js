const { MillingProcess, Stock } = require('../models');

// Fixed percentages for milling output
const MILLING_PERCENTAGES = {
  rice: 0.67,    // 67%
  bran: 0.08,    // 8%
  broken: 0.04,  // 4%
  rafi: 0.03,    // 3%
  husk: 0.18     // 18%
};

// Helper to get stock (MongoDB or memory)
const getStock = async () => {
  if (global.memoryDB) {
    return global.memoryDB.stock;
  }
  let stock = await Stock.findOne();
  if (!stock) {
    stock = new Stock({
      paddy: { quantity: 0, unit: 'Qu', bags: 0 },
      rice: { quantity: 0, unit: 'Qu' },
      bran: { quantity: 0, unit: 'Qu' },
      broken: { quantity: 0, unit: 'Qu' },
      rafi: { quantity: 0, unit: 'Qu' },
      husk: { quantity: 0, unit: 'Qu' }
    });
    await stock.save();
  }
  return stock;
};

// Process milling
exports.processMilling = async (req, res) => {
  try {
    const { date, quantity, unit, rice, bran, broken, rafi, husk } = req.body;
    const quantityMilled = parseFloat(quantity);

    if (!quantityMilled || quantityMilled <= 0) {
      return res.status(400).json({ success: false, error: 'Valid quantity is required' });
    }

    // Get current stock
    const stock = await getStock();

    // Check if enough paddy available
    if (stock.paddy.quantity < quantityMilled) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient paddy stock. Available: ${stock.paddy.quantity} ${stock.paddy.unit}` 
      });
    }

    // Use provided outputs or calculate based on percentages
    const outputs = {
      rice: {
        quantity: parseFloat(rice) || parseFloat((quantityMilled * MILLING_PERCENTAGES.rice).toFixed(2)),
        unit
      },
      bran: {
        quantity: parseFloat(bran) || parseFloat((quantityMilled * MILLING_PERCENTAGES.bran).toFixed(2)),
        unit
      },
      broken: {
        quantity: parseFloat(broken) || parseFloat((quantityMilled * MILLING_PERCENTAGES.broken).toFixed(2)),
        unit
      },
      rafi: {
        quantity: parseFloat(rafi) || parseFloat((quantityMilled * MILLING_PERCENTAGES.rafi).toFixed(2)),
        unit
      },
      husk: {
        quantity: parseFloat(husk) || parseFloat((quantityMilled * MILLING_PERCENTAGES.husk).toFixed(2)),
        unit
      }
    };

    // Create milling record
    const millingData = {
      date: date || new Date(),
      quantityMilled,
      unit,
      outputs,
      createdAt: new Date()
    };

    if (global.memoryDB) {
      global.memoryDB.millingProcesses.push(millingData);
    } else {
      const milling = new MillingProcess(millingData);
      await milling.save();
    }

    // Update stock - reduce paddy
    stock.paddy.quantity -= quantityMilled;
    if (stock.paddy.quantity <= 0) {
      stock.paddy.bags = 0;
      stock.paddy.quantity = 0;
    }

    // Add outputs to stock
    stock.rice.quantity += outputs.rice.quantity;
    stock.rice.unit = unit;
    stock.bran.quantity += outputs.bran.quantity;
    stock.bran.unit = unit;
    stock.broken.quantity += outputs.broken.quantity;
    stock.broken.unit = unit;
    stock.rafi.quantity += outputs.rafi.quantity;
    stock.rafi.unit = unit;
    stock.husk.quantity += outputs.husk.quantity;
    stock.husk.unit = unit;

    if (!global.memoryDB) {
      await stock.save();
    }

    res.status(201).json({ success: true, data: millingData });
  } catch (error) {
    console.error('Milling error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all milling processes
exports.getMillingProcesses = async (req, res) => {
  try {
    if (global.memoryDB) {
      return res.status(200).json({ success: true, data: global.memoryDB.millingProcesses });
    }
    const processes = await MillingProcess.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: processes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get milling processes by date range
exports.getMillingByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (global.memoryDB) {
      const processes = global.memoryDB.millingProcesses.filter(p => {
        const d = new Date(p.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
      return res.status(200).json({ success: true, data: processes });
    }
    
    const processes = await MillingProcess.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    res.status(200).json({ success: true, data: processes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update milling process
exports.updateMilling = async (req, res) => {
  try {
    const { date, quantity, unit, rice, bran, broken, rafi, husk } = req.body;
    
    if (global.memoryDB) {
      const index = global.memoryDB.millingProcesses.findIndex(m => m._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Milling entry not found' });
      }
      
      const oldMilling = global.memoryDB.millingProcesses[index];
      const stock = global.memoryDB.stock;
      
      // Revert old stock changes
      stock.paddy.quantity += oldMilling.quantityMilled;
      stock.rice.quantity -= oldMilling.outputs.rice.quantity;
      stock.bran.quantity -= oldMilling.outputs.bran.quantity;
      stock.broken.quantity -= oldMilling.outputs.broken.quantity;
      stock.rafi.quantity -= oldMilling.outputs.rafi.quantity;
      stock.husk.quantity -= oldMilling.outputs.husk.quantity;
      
      // Update milling
      const newQuantity = parseFloat(quantity);
      const updatedMilling = {
        ...oldMilling,
        date: date || oldMilling.date,
        quantityMilled: newQuantity,
        unit: unit || oldMilling.unit,
        outputs: {
          rice: { quantity: parseFloat(rice) || 0, unit },
          bran: { quantity: parseFloat(bran) || 0, unit },
          broken: { quantity: parseFloat(broken) || 0, unit },
          rafi: { quantity: parseFloat(rafi) || 0, unit },
          husk: { quantity: parseFloat(husk) || 0, unit }
        }
      };
      
      global.memoryDB.millingProcesses[index] = updatedMilling;
      
      // Apply new stock changes
      stock.paddy.quantity -= newQuantity;
      stock.rice.quantity += updatedMilling.outputs.rice.quantity;
      stock.bran.quantity += updatedMilling.outputs.bran.quantity;
      stock.broken.quantity += updatedMilling.outputs.broken.quantity;
      stock.rafi.quantity += updatedMilling.outputs.rafi.quantity;
      stock.husk.quantity += updatedMilling.outputs.husk.quantity;
      
      return res.status(200).json({ success: true, data: updatedMilling });
    }
    
    res.status(501).json({ success: false, error: 'Update not implemented for MongoDB' });
  } catch (error) {
    console.error('Update milling error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete milling process
exports.deleteMilling = async (req, res) => {
  try {
    if (global.memoryDB) {
      const index = global.memoryDB.millingProcesses.findIndex(m => m._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Milling entry not found' });
      }
      
      const milling = global.memoryDB.millingProcesses[index];
      const stock = global.memoryDB.stock;
      
      // Revert stock changes
      stock.paddy.quantity += milling.quantityMilled;
      stock.rice.quantity -= milling.outputs.rice.quantity;
      stock.bran.quantity -= milling.outputs.bran.quantity;
      stock.broken.quantity -= milling.outputs.broken.quantity;
      stock.rafi.quantity -= milling.outputs.rafi.quantity;
      stock.husk.quantity -= milling.outputs.husk.quantity;
      
      // Ensure no negative stock
      if (stock.rice.quantity < 0) stock.rice.quantity = 0;
      if (stock.bran.quantity < 0) stock.bran.quantity = 0;
      if (stock.broken.quantity < 0) stock.broken.quantity = 0;
      if (stock.rafi.quantity < 0) stock.rafi.quantity = 0;
      if (stock.husk.quantity < 0) stock.husk.quantity = 0;
      
      global.memoryDB.millingProcesses.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Milling entry deleted successfully' });
    }
    
    res.status(501).json({ success: false, error: 'Delete not implemented for MongoDB' });
  } catch (error) {
    console.error('Delete milling error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
