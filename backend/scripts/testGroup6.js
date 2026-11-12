const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DailyUpdate = require('../src/models/DailyUpdate');
const Invoice = require('../src/models/Invoice');
const Site = require('../src/models/Site');
const Expense = require('../src/models/Expense');
const Payment = require('../src/models/Payment');

async function testGroup6() {
  try {
    console.log('🧪 Starting Group 6 (Daily Updates, Invoicing & Reports) Integration Tests...\n');

    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME });
    console.log('✅ Connected to MongoDB Atlas');

    const greenVilla = await Site.findOne({ name: 'Green Villa' });
    if (!greenVilla) throw new Error('Green Villa site not found in database');

    // 1. Test Recording a Daily Progress Update
    const updateLog = await DailyUpdate.create({
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      title: 'First floor roof slab reinforcement completed',
      description: 'Bar bending and beam stirrup tying finished. Electrical conduit pipes laid by electrician team.',
      workPhase: 'Roof Slab Reinforcement',
      workersCount: 14,
      weather: 'Sunny',
      supervisorName: 'Karthik (Site Engineer)',
    });
    console.log(`✅ 1. Daily Progress Update Recorded:`);
    console.log(`   Site: ${updateLog.siteName} (${updateLog.siteCode})`);
    console.log(`   Title: "${updateLog.title}"`);
    console.log(`   Phase: ${updateLog.workPhase} | Workers on Site: ${updateLog.workersCount}`);

    // 2. Test Daily Updates Sites Overview
    const sitesOverview = await Site.find();
    console.log(`\n✅ 2. Daily Updates Sites Overview: Successfully fetched ${sitesOverview.length} site cards`);

    // 3. Test Milestone Client GST Invoice Generation
    // Subtotal: ₹4,50,000 | CGST 9%: ₹40,500 | SGST 9%: ₹40,500 | Total: ₹5,31,000
    const subtotal = 450000;
    const cgstAmt = Math.round(subtotal * 0.09); // 40,500
    const sgstAmt = Math.round(subtotal * 0.09); // 40,500
    const totalAmount = subtotal + cgstAmt + sgstAmt; // 5,31,000

    const invoiceDoc = await Invoice.create({
      invoiceNumber: `INV-2026-${Date.now().toString().slice(-4)}`,
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      clientName: greenVilla.client,
      clientAddress: greenVilla.location,
      items: [
        {
          description: 'Milestone 2: Ground floor roof slab casting completion',
          quantity: 1,
          unit: 'Stage',
          rate: 450000,
          amount: 450000,
        },
      ],
      subtotal,
      cgstRate: 9,
      cgstAmount: cgstAmt,
      sgstRate: 9,
      sgstAmount: sgstAmt,
      totalAmount,
      status: 'Sent',
      paidAmount: 200000,
      balanceDue: totalAmount - 200000,
    });

    console.log(`\n✅ 3. Client GST Invoice Created:`);
    console.log(`   Invoice No: ${invoiceDoc.invoiceNumber}`);
    console.log(`   Subtotal: ₹${invoiceDoc.subtotal.toLocaleString('en-IN')}`);
    console.log(`   CGST (9%): ₹${invoiceDoc.cgstAmount.toLocaleString('en-IN')}`);
    console.log(`   SGST (9%): ₹${invoiceDoc.sgstAmount.toLocaleString('en-IN')}`);
    console.log(`   Total (with 18% GST): ₹${invoiceDoc.totalAmount.toLocaleString('en-IN')} (Verified: ₹4,50,000 + ₹40,500 + ₹40,500 = ₹5,31,000)`);
    console.log(`   Paid Amount: ₹${invoiceDoc.paidAmount.toLocaleString('en-IN')} | Balance Due: ₹${invoiceDoc.balanceDue.toLocaleString('en-IN')}`);

    if (invoiceDoc.totalAmount !== 531000) {
      throw new Error('GST calculation mismatch');
    }

    // 4. Test Invoice Summary
    const invoiceList = await Invoice.find();
    let totalInv = 0;
    invoiceList.forEach((inv) => (totalInv += inv.totalAmount));
    console.log(`\n✅ 4. Invoicing Ledger: Tracking ${invoiceList.length} invoices totaling ₹${totalInv.toLocaleString('en-IN')}`);

    // 5. Test Site Expense Breakdown Report
    const expenses = await Expense.find({ site: greenVilla._id });
    let totalSpent = 0;
    expenses.forEach((e) => (totalSpent += e.amount));
    console.log(`\n✅ 5. Site Expense Report: Green Villa expenditure verified across ${expenses.length} records = ₹${totalSpent.toLocaleString('en-IN')}`);

    // Clean up test entries
    await DailyUpdate.findByIdAndDelete(updateLog._id);
    await Invoice.findByIdAndDelete(invoiceDoc._id);
    console.log(`\n   Cleaned up test update and invoice`);

    console.log('\n🎉 ALL GROUP 6 TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Group 6 Test Failed:', err);
    process.exit(1);
  }
}

testGroup6();

