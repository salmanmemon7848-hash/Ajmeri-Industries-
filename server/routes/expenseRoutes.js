const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/', expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.get('/by-date', expenseController.getExpensesByDate);
router.get('/daily', expenseController.getDailyExpenses);
router.get('/monthly', expenseController.getMonthlyExpenses);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
