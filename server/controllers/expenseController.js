const { Expense } = require('../models');

// Add expense
exports.addExpense = async (req, res) => {
  try {
    const { date, category, amount, description } = req.body;
    
    const expense = {
      _id: Date.now().toString(),
      date: date || new Date(),
      category,
      amount: parseFloat(amount) || 0,
      description,
      createdAt: new Date()
    };
    
    if (global.memoryDB) {
      global.memoryDB.expenses.push(expense);
      return res.status(201).json({ success: true, data: expense });
    }
    
    const mongoExpense = new Expense(expense);
    await mongoExpense.save();
    res.status(201).json({ success: true, data: mongoExpense });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    if (global.memoryDB) {
      return res.status(200).json({ success: true, data: global.memoryDB.expenses });
    }
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get expenses by date range
exports.getExpensesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (global.memoryDB) {
      const expenses = global.memoryDB.expenses.filter(e => {
        const d = new Date(e.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
      return res.status(200).json({ success: true, data: expenses });
    }
    
    const expenses = await Expense.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get daily expenses
exports.getDailyExpenses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (global.memoryDB) {
      const expenses = global.memoryDB.expenses.filter(e => {
        const d = new Date(e.date);
        return d >= today && d < tomorrow;
      });
      const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      return res.status(200).json({ success: true, data: { expenses, total } });
    }
    
    const expenses = await Expense.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    res.status(200).json({ success: true, data: { expenses, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get monthly expenses
exports.getMonthlyExpenses = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    if (global.memoryDB) {
      const expenses = global.memoryDB.expenses.filter(e => {
        const d = new Date(e.date);
        return d >= startOfMonth && d <= endOfMonth;
      });
      const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      return res.status(200).json({ success: true, data: { expenses, total } });
    }
    
    const expenses = await Expense.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    res.status(200).json({ success: true, data: { expenses, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    if (global.memoryDB) {
      const index = global.memoryDB.expenses.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Expense not found' });
      }
      global.memoryDB.expenses.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    }
    
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
