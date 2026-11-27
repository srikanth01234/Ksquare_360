const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

/**
 * Recalculate paidAmount, pendingAmount, and paymentStatus on an Expense
 * strictly from all cleared/paid OUTGOING Payment documents linked to it.
 */
async function recalculateExpensePaymentState(expenseId) {
  if (!expenseId) return null;

  const expense = await Expense.findById(expenseId);
  if (!expense) return null;

  const linkedPayments = await Payment.find({
    expense: expense._id,
    flowType: 'OUTGOING',
    status: { $in: ['Cleared', 'Paid'] },
  });

  const totalPaid = linkedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalAmt = Number(expense.amount) || 0;

  expense.paidAmount = Math.min(totalAmt, Math.max(0, totalPaid));
  expense.pendingAmount = Math.max(0, totalAmt - expense.paidAmount);

  if (expense.paidAmount <= 0) {
    expense.paymentStatus = 'Pending';
    expense.paymentMode = '';
  } else if (expense.pendingAmount <= 0) {
    expense.paymentStatus = 'Paid';
    if (!expense.paymentMode && linkedPayments[0]?.paymentMode) {
      expense.paymentMode = linkedPayments[0].paymentMode;
    }
  } else {
    expense.paymentStatus = 'Partial';
    if (!expense.paymentMode && linkedPayments[0]?.paymentMode) {
      expense.paymentMode = linkedPayments[0].paymentMode;
    }
  }

  await expense.save();
  return expense;
}

/**
 * Map a Payment category to a valid Expense category enum
 */
function mapPaymentCategoryToExpenseCategory(paymentCategory = '') {
  const c = String(paymentCategory).toLowerCase();
  if (c.includes('material')) return 'Materials';
  if (c.includes('labour')) return 'Labour';
  if (c.includes('rental') || c.includes('vehicle') || c.includes('machinery')) return 'Rental';
  if (c.includes('additional')) return 'Additional Work';
  return 'Other';
}

module.exports = {
  recalculateExpensePaymentState,
  mapPaymentCategoryToExpenseCategory,
};
