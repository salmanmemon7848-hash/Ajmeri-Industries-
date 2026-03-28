const { PaddyPurchase, Stock } = require('../models');

// Helper to get stock
const getStock = async () => {
  if (global.memoryDB) {
    return global.memoryDB.stock;
  }
  let stock = await Stock.findOne();
  if (!stock) {
    stock = new Stock();
    await stock.save();
  }
  return stock;
};

// Add paddy purchase
exports.addPaddyPurchase = async (req, res) => {
  try {
    const { date, bags, bagType, source, hamali, quantity, unit } = req.body;

    // Create purchase record
    const purchase = {
      _id: Date.now().toString(),
      date: date || new Date(),
      bags: parseInt(bags) || 0,
      bagType,
      source,
      hamali: parseFloat(hamali) || 0,
      quantity: parseFloat(quantity) || 0,
      unit,
      createdAt: new Date()
    };

    if (global.memoryDB) {
      global.memoryDB.paddyPurchases.push(purchase);
      
      // Update stock
      const stock = global.memoryDB.stock;
      stock.paddy.bags += purchase.bags;
      stock.paddy.quantity += purchase.quantity;
      stock.paddy.unit = unit;
      
      return res.status(201).json({ success: true, data: purchase });
    }

    // MongoDB fallback
    const mongoPurchase = new PaddyPurchase(purchase);
    await mongoPurchase.save();

    // Update stock
    const stock = await getStock();
    stock.paddy.bags += purchase.bags;
    stock.paddy.quantity += purchase.quantity;
    stock.paddy.unit = unit;
    await stock.save();

    res.status(201).json({ success: true, data: mongoPurchase });
  } catch (error) {
    console.error('Add paddy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all paddy purchases
exports.getPaddyPurchases = async (req, res) => {
  try {
    if (global.memoryDB) {
      return res.status(200).json({ success: true, data: global.memoryDB.paddyPurchases });
    }
    const purchases = await PaddyPurchase.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get paddy purchases by date range
exports.getPaddyPurchasesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (global.memoryDB) {
      const purchases = global.memoryDB.paddyPurchases.filter(p => {
        const d = new Date(p.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
      return res.status(200).json({ success: true, data: purchases });
    }
    
    const purchases = await PaddyPurchase.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update paddy purchase
exports.updatePaddyPurchase = async (req, res) => {
  try {
    const { date, bags, bagType, source, hamali, quantity, unit } = req.body;
    
    if (global.memoryDB) {
      const index = global.memoryDB.paddyPurchases.findIndex(p => p._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Purchase not found' });
      }
      
      const oldPurchase = global.memoryDB.paddyPurchases[index];
      const stock = global.memoryDB.stock;
      
      // Revert old stock
      stock.paddy.bags -= oldPurchase.bags;
      stock.paddy.quantity -= oldPurchase.quantity;
      
      // Update purchase
      const updatedPurchase = {
        ...oldPurchase,
        date: date || oldPurchase.date,
        bags: parseInt(bags) || oldPurchase.bags,
        bagType: bagType || oldPurchase.bagType,
        source: source || oldPurchase.source,
        hamali: parseFloat(hamali) || oldPurchase.hamali,
        quantity: parseFloat(quantity) || oldPurchase.quantity,
        unit: unit || oldPurchase.unit
      };
      
      global.memoryDB.paddyPurchases[index] = updatedPurchase;
      
      // Apply new stock
      stock.paddy.bags += updatedPurchase.bags;
      stock.paddy.quantity += updatedPurchase.quantity;
      stock.paddy.unit = updatedPurchase.unit;
      
      return res.status(200).json({ success: true, data: updatedPurchase });
    }
    
    // MongoDB fallback
    const purchase = await PaddyPurchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Purchase not found' });
    }
    
    // Revert old stock
    const stock = await getStock();
    stock.paddy.bags -= purchase.bags;
    stock.paddy.quantity -= purchase.quantity;
    
    // Update purchase
    purchase.date = date || purchase.date;
    purchase.bags = parseInt(bags) || purchase.bags;
    purchase.bagType = bagType || purchase.bagType;
    purchase.source = source || purchase.source;
    purchase.hamali = parseFloat(hamali) || purchase.hamali;
    purchase.quantity = parseFloat(quantity) || purchase.quantity;
    purchase.unit = unit || purchase.unit;
    await purchase.save();
    
    // Apply new stock
    stock.paddy.bags += purchase.bags;
    stock.paddy.quantity += purchase.quantity;
    stock.paddy.unit = purchase.unit;
    await stock.save();
    
    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    console.error('Update paddy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete paddy purchase
exports.deletePaddyPurchase = async (req, res) => {
  try {
    if (global.memoryDB) {
      const index = global.memoryDB.paddyPurchases.findIndex(p => p._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Purchase not found' });
      }
      
      const purchase = global.memoryDB.paddyPurchases[index];
      const stock = global.memoryDB.stock;
      
      // Revert stock
      stock.paddy.bags -= purchase.bags;
      stock.paddy.quantity -= purchase.quantity;
      if (stock.paddy.bags < 0) stock.paddy.bags = 0;
      if (stock.paddy.quantity < 0) stock.paddy.quantity = 0;
      
      global.memoryDB.paddyPurchases.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
    }
    
    const purchase = await PaddyPurchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Purchase not found' });
    }
    
    // Revert stock
    const stock = await getStock();
    stock.paddy.bags -= purchase.bags;
    stock.paddy.quantity -= purchase.quantity;
    if (stock.paddy.bags < 0) stock.paddy.bags = 0;
    if (stock.paddy.quantity < 0) stock.paddy.quantity = 0;
    await stock.save();
    
    await purchase.deleteOne();
    res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Delete paddy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
