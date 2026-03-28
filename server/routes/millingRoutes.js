const express = require('express');
const router = express.Router();
const millingController = require('../controllers/millingController');

router.post('/', millingController.processMilling);
router.get('/', millingController.getMillingProcesses);
router.get('/by-date', millingController.getMillingByDate);
router.put('/:id', millingController.updateMilling);
router.delete('/:id', millingController.deleteMilling);

module.exports = router;
