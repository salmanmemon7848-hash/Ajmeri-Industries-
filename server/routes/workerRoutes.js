const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.post('/', workerController.addWorker);
router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerById);
router.post('/:id/payment', workerController.addPayment);
router.delete('/:id', workerController.deleteWorker);

module.exports = router;
