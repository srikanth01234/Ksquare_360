const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceSummary,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');

router.get('/summary', getInvoiceSummary);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

module.exports = router;

