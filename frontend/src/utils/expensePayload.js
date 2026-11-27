/**
 * Build a standardized backend payload for POST /api/expenses
 * Used identically across DailyUpdates, SiteDetails, SiteExpenses, and SiteExpenseDetails.
 */
export function buildExpensePayload(newExp, siteContext = null) {
  const siteId = newExp.siteId || siteContext?._id || siteContext?.id || null;
  const siteName = newExp.siteName || siteContext?.name || 'Site';
  const siteCode = newExp.siteCode || siteContext?.code || '';

  const amount =
    typeof newExp.amount === 'number'
      ? newExp.amount
      : typeof newExp.totalExpenseAmount === 'number'
      ? newExp.totalExpenseAmount
      : parseFloat(String(newExp.amount || '').replace(/[^\d.]/g, '')) || 0;

  const isAddWork = Boolean(
    newExp.isAdditionalWork || newExp.category === 'Additional Work'
  );

  const paymentStatus = newExp.paymentStatus || 'Paid';
  const paymentMode =
    paymentStatus === 'Pending'
      ? ''
      : newExp.paymentMethod === 'UPI'
      ? 'UPI (GPay)'
      : newExp.paymentMethod || newExp.paymentMode || 'Cash';

  return {
    siteId,
    site: siteId,
    siteName,
    siteCode,
    category: newExp.category,
    subCategory: newExp.subCategory || (isAddWork ? 'Materials' : newExp.category),
    expenseType: newExp.expenseType || (isAddWork ? 'ADDITIONAL_WORK' : 'NORMAL'),
    isAdditionalWork: isAddWork,
    billableToClient: Boolean(newExp.billableToClient),
    description: newExp.description,
    materialName: newExp.materialName || '',
    supplierName: newExp.supplierName || newExp.supplier || '-',
    invoiceBillNo: newExp.invoiceNo && newExp.invoiceNo !== '-' ? newExp.invoiceNo : '',
    amount,
    calculatedAmount: newExp.calculatedAmount ?? amount,
    billingAmount: newExp.billingAmount ?? null,
    labourDetails: newExp.labourDetails || null,
    quantity: newExp.quantity,
    unit: newExp.unit,
    rate: newExp.rate,
    paymentStatus,
    paidAmount: newExp.paidAmount,
    pendingAmount: newExp.pendingAmount,
    paymentMode,
    referenceNo: newExp.transactionId || undefined,
    date: newExp.date || new Date().toISOString(),
    items: newExp.materialItems || newExp.items || [],
    receiptUrl: newExp.receiptUrl || newExp.paymentScreenshot || '',
    notes: newExp.notes || '',
  };
}
