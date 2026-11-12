const express = require('express');
const router = express.Router();
const {
  getGodownStocks,
  recordStockInward,
  recordStockOutward,
  getStockMovements,
} = require('../controllers/godownController');

router.get('/stocks', getGodownStocks);
router.post('/inward', recordStockInward);
router.post('/outward', recordStockOutward);
router.get('/movements', getStockMovements);

module.exports = router;

