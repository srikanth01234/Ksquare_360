const express = require('express');
const router = express.Router();
const {
  getSiteExpenseReport,
  getMaterialConsumptionReport,
  getFinancialOverviewReport,
} = require('../controllers/reportController');

router.get('/site-expenses', getSiteExpenseReport);
router.get('/material-consumption', getMaterialConsumptionReport);
router.get('/financial-overview', getFinancialOverviewReport);

module.exports = router;

