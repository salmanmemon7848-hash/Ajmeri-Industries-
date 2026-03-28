const { PaddyPurchase, MillingProcess, Expense, Sale, Worker } = require('../models');

// Get daily report
exports.getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's purchases
    const purchases = await PaddyPurchase.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const totalPurchase = purchases.reduce((sum, p) => sum + (p.hamali || 0), 0);

    // Get today's milling
    const milling = await MillingProcess.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const totalMilling = milling.reduce((sum, m) => sum + m.quantityMilled, 0);

    // Get today's expenses (including worker payments)
    const expenses = await Expense.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Get today's sales
    const sales = await Sale.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Calculate profit/loss
    const netProfit = totalSales - expensesTotal;

    res.status(200).json({
      success: true,
      data: {
        date: today,
        purchases: {
          count: purchases.length,
          totalHamali: totalPurchase,
          items: purchases
        },
        milling: {
          count: milling.length,
          totalQuantity: totalMilling,
          items: milling
        },
        expenses: {
          count: expenses.length,
          total: expensesTotal,
          items: expenses
        },
        sales: {
          count: sales.length,
          total: totalSales,
          items: sales
        },
        profit: {
          totalSales,
          totalExpenses: expensesTotal,
          netProfit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get monthly report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startOfMonth = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const endOfMonth = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1), 0, 23, 59, 59);

    // Get monthly purchases
    const purchases = await PaddyPurchase.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalPurchaseHamali = purchases.reduce((sum, p) => sum + (p.hamali || 0), 0);
    const totalPurchaseQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);

    // Get monthly milling
    const milling = await MillingProcess.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalMilled = milling.reduce((sum, m) => sum + m.quantityMilled, 0);

    // Get monthly expenses
    const expenses = await Expense.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Get monthly sales
    const sales = await Sale.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Get all worker payments
    const workers = await Worker.find();
    let totalWorkerPayments = 0;
    workers.forEach(worker => {
      worker.payments.forEach(payment => {
        if (payment.date >= startOfMonth && payment.date <= endOfMonth) {
          totalWorkerPayments += payment.amount;
        }
      });
    });

    // Calculate profit/loss
    const totalAllExpenses = totalExpenses + totalWorkerPayments + totalPurchaseHamali;
    const netProfit = totalSales - totalAllExpenses;

    res.status(200).json({
      success: true,
      data: {
        month: startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
        purchases: {
          count: purchases.length,
          totalQuantity: totalPurchaseQuantity,
          totalHamali: totalPurchaseHamali
        },
        milling: {
          count: milling.length,
          totalQuantity: totalMilled
        },
        expenses: {
          operational: totalExpenses,
          workerPayments: totalWorkerPayments,
          hamali: totalPurchaseHamali,
          total: totalAllExpenses
        },
        sales: {
          count: sales.length,
          total: totalSales
        },
        profit: {
          totalSales,
          totalExpenses: totalAllExpenses,
          netProfit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get current stock
    let stock;
    if (global.memoryDB) {
      stock = global.memoryDB.stock;
    } else {
      const { Stock } = require('../models');
      stock = await Stock.findOne();
      if (!stock) {
        stock = { paddy: { bags: 0, quantity: 0, unit: 'Qu' }, rice: { quantity: 0, unit: 'Qu' }, bran: { quantity: 0, unit: 'Qu' }, broken: { quantity: 0, unit: 'Qu' }, rafi: { quantity: 0, unit: 'Qu' }, husk: { quantity: 0, unit: 'Qu' } };
      }
    }

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayPurchases = [], todayMilling = [], todayExpenses = [], todaySales = [];
    let monthlyExpenses = [], monthlySales = [];

    if (global.memoryDB) {
      todayPurchases = global.memoryDB.paddyPurchases.filter(p => {
        const d = new Date(p.date);
        return d >= today && d < tomorrow;
      });
      todayMilling = global.memoryDB.millingProcesses.filter(m => {
        const d = new Date(m.date);
        return d >= today && d < tomorrow;
      });
      todayExpenses = global.memoryDB.expenses.filter(e => {
        const d = new Date(e.date);
        return d >= today && d < tomorrow;
      });
      todaySales = global.memoryDB.sales.filter(s => {
        const d = new Date(s.date);
        return d >= today && d < tomorrow;
      });
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      monthlyExpenses = global.memoryDB.expenses.filter(e => new Date(e.date) >= startOfMonth);
      monthlySales = global.memoryDB.sales.filter(s => new Date(s.date) >= startOfMonth);
    } else {
      todayPurchases = await PaddyPurchase.find({ date: { $gte: today, $lt: tomorrow } });
      todayMilling = await MillingProcess.find({ date: { $gte: today, $lt: tomorrow } });
      todayExpenses = await Expense.find({ date: { $gte: today, $lt: tomorrow } });
      todaySales = await Sale.find({ date: { $gte: today, $lt: tomorrow } });
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      monthlyExpenses = await Expense.find({ date: { $gte: startOfMonth } });
      monthlySales = await Sale.find({ date: { $gte: startOfMonth } });
    }

    const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalMonthlySales = monthlySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        stock: {
          paddy: stock.paddy || { bags: 0, quantity: 0, unit: 'Qu' },
          rice: stock.rice || { quantity: 0, unit: 'Qu' },
          bran: stock.bran || { quantity: 0, unit: 'Qu' },
          broken: stock.broken || { quantity: 0, unit: 'Qu' },
          rafi: stock.rafi || { quantity: 0, unit: 'Qu' },
          husk: stock.husk || { quantity: 0, unit: 'Qu' }
        },
        today: {
          purchases: todayPurchases.length,
          milling: todayMilling.reduce((sum, m) => sum + (m.quantityMilled || 0), 0),
          expenses: todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
          sales: todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
        },
        monthly: {
          totalExpenses: totalMonthlyExpenses,
          totalSales: totalMonthlySales,
          netProfit: totalMonthlySales - totalMonthlyExpenses
        }
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
