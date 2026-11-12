const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    flowType: {
      type: String,
      enum: ['RECEIVED', 'OUTGOING'],
      required: true,
      index: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      default: null,
    },
    siteName: {
      type: String,
      default: '',
    },
    siteCode: {
      type: String,
      default: '',
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
    partyName: {
      type: String, // Client name (for RECEIVED) or Beneficiary/Supplier (for OUTGOING)
      required: true,
      trim: true,
    },
    category: {
      type: String, // 'Client Milestone', 'Advance', 'Materials', 'Labour Wages', 'Machinery Rental'
      default: 'General',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ['Bank Transfer (NEFT)', 'Bank Transfer (RTGS)', 'UPI (GPay)', 'UPI (PhonePe)', 'Cheque', 'Cash'],
      default: 'Bank Transfer (NEFT)',
    },
    referenceNo: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceRef: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Cleared', 'Pending', 'Paid'],
      default: 'Cleared',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);

