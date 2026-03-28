const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.post('/', saleController.addSale);
router.get('/', saleController.getSales);
router.get('/by-date', saleController.getSalesByDate);
router.get('/daily', saleController.getDailySales);
router.get('/monthly', saleController.getMonthlySales);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
