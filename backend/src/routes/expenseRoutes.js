const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

router.get('/summary', getExpenseSummary);

router.route('/')
  .get(getExpenses)
  .post(upload.single('receipt'), createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(upload.single('receipt'), updateExpense)
  .delete(deleteExpense);

module.exports = router;

