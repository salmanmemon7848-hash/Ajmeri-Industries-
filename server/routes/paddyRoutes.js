const express = require('express');
const router = express.Router();
const paddyController = require('../controllers/paddyController');

router.post('/', paddyController.addPaddyPurchase);
router.get('/', paddyController.getPaddyPurchases);
router.get('/by-date', paddyController.getPaddyPurchasesByDate);
router.put('/:id', paddyController.updatePaddyPurchase);
router.delete('/:id', paddyController.deletePaddyPurchase);

module.exports = router;
