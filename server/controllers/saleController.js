const { Sale, Stock } = require('../models');

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

// Add sale
exports.addSale = async (req, res) => {
  try {
    const { date, productType, quantity, unit, price, customerName } = req.body;
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);

    // Get current stock
    const stock = await getStock();

    // Check if enough stock available
    const productKey = productType.toLowerCase();
    if (!stock[productKey] || stock[productKey].quantity < qty) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient ${productType} stock. Available: ${stock[productKey]?.quantity || 0} ${stock[productKey]?.unit || unit}` 
      });
    }

    // Calculate total amount
    const totalAmount = qty * prc;

    // Create sale record
    const sale = {
      _id: Date.now().toString(),
      date: date || new Date(),
      productType,
      quantity: qty,
      unit,
      price: prc,
      customerName,
      totalAmount,
      createdAt: new Date()
    };

    if (global.memoryDB) {
      global.memoryDB.sales.push(sale);
      
      // Update stock - reduce product quantity
      stock[productKey].quantity -= qty;
      if (stock[productKey].quantity < 0) {
        stock[productKey].quantity = 0;
      }
      
      return res.status(201).json({ success: true, data: sale });
    }

    // MongoDB fallback
    const mongoSale = new Sale(sale);
    await mongoSale.save();

    // Update stock - reduce product quantity
    stock[productKey].quantity -= qty;
    if (stock[productKey].quantity < 0) {
      stock[productKey].quantity = 0;
    }
    await stock.save();

    res.status(201).json({ success: true, data: mongoSale });
  } catch (error) {
    console.error('Add sale error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all sales
exports.getSales = async (req, res) => {
  try {
    if (global.memoryDB) {
      return res.status(200).json({ success: true, data: global.memoryDB.sales });
    }
    const sales = await Sale.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sales by date range
exports.getSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (global.memoryDB) {
      const sales = global.memoryDB.sales.filter(s => {
        const d = new Date(s.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
      return res.status(200).json({ success: true, data: sales });
    }
    
    const sales = await Sale.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get daily sales
exports.getDailySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (global.memoryDB) {
      const sales = global.memoryDB.sales.filter(s => {
        const d = new Date(s.date);
        return d >= today && d < tomorrow;
      });
      const total = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      return res.status(200).json({ success: true, data: { sales, total } });
    }
    
    const sales = await Sale.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    res.status(200).json({ success: true, data: { sales, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get monthly sales
exports.getMonthlySales = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    if (global.memoryDB) {
      const sales = global.memoryDB.sales.filter(s => {
        const d = new Date(s.date);
        return d >= startOfMonth && d <= endOfMonth;
      });
      const total = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      return res.status(200).json({ success: true, data: { sales, total } });
    }
    
    const sales = await Sale.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    res.status(200).json({ success: true, data: { sales, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    if (global.memoryDB) {
      const index = global.memoryDB.sales.findIndex(s => s._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Sale not found' });
      }
      global.memoryDB.sales.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Sale deleted successfully' });
    }
    
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale not found' });
    }
    res.status(200).json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
