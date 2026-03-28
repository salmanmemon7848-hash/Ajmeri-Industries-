const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getStock);
router.put('/', stockController.updateStock);
router.post('/reset', stockController.resetStock);
router.post('/reset-all', stockController.resetAllData);

module.exports = router;
