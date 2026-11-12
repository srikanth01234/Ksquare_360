const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getPayments,
  getPaymentSummary,
  getPendingExpenses,
  createPayment,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');

router.get('/summary', getPaymentSummary);
router.get('/pending-expenses', getPendingExpenses);

router.route('/')
  .get(getPayments)
  .post(upload.single('receipt'), createPayment);

router.route('/:id')
  .put(upload.single('receipt'), updatePayment)
  .delete(deletePayment);

module.exports = router;

