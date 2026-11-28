const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

/**
 * Recalculate paidAmount, pendingAmount, and paymentStatus on an Expense
 * strictly from all cleared/paid OUTGOING Payment documents linked to it.
 */
const CLEARED_PAYMENT_STATUSES = ['Cleared', 'Paid'];

function isAdditionalWork(expense) {
  return expense.category === 'Additional Work' ||
    expense.expenseType === 'ADDITIONAL_WORK' ||
    expense.isAdditionalWork === true || expense.isAdditionalWork === 'true';
}

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

async function getClearedExpensePayments(expenseId, exceptId) {
  const filter = {
    expense: expenseId,
    flowType: 'OUTGOING',
    status: { $in: CLEARED_PAYMENT_STATUSES },
  };
  if (exceptId) filter._id = { $ne: exceptId };
  return Payment.find(filter).sort({ date: 1, _id: 1 });
}

function sumPayments(payments) {
  return money(payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0));
}

async function recalculateExpensePaymentState(expenseId, historicalPaid = 0) {
  if (!expenseId) return null;

  const expense = await Expense.findById(expenseId);
  if (!expense) return null;

  const linkedPayments = await getClearedExpensePayments(expense._id);
  const totalPaid = money(sumPayments(linkedPayments) + historicalPaid);
  const totalAmt = money(expense.amount);
  expense.paidAmount = Math.min(totalAmt, totalPaid);
  expense.pendingAmount = Math.max(0, money(totalAmt - expense.paidAmount));
  expense.paymentMode = linkedPayments[0]?.paymentMode || '';
  if (!expense.referenceNo && linkedPayments[0]) expense.referenceNo = linkedPayments[0].referenceNo;

  if (expense.paidAmount <= 0) {
    expense.paymentStatus = 'Pending';
    expense.paymentMode = '';
  } else if (expense.pendingAmount <= 0) {
    expense.paymentStatus = 'Paid';
  } else {
    expense.paymentStatus = 'Partial';
  }

  // Serialize competing ledger writes, including those that leave the balance unchanged.
  expense.increment();
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
  CLEARED_PAYMENT_STATUSES,
  isAdditionalWork,
  money,
  getClearedExpensePayments,
  sumPayments,
  recalculateExpensePaymentState,
  mapPaymentCategoryToExpenseCategory,
};
