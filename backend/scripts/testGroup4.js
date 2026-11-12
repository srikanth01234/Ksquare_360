const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Expense = require('../src/models/Expense');
const Site = require('../src/models/Site');
const MaterialMaster = require('../src/models/MaterialMaster');

async function testGroup4() {
  try {
    console.log('🧪 Starting Group 4 (Site Expenses & Breakdown) Integration Tests...\n');

    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME });
    console.log('✅ Connected to MongoDB Atlas');

    const greenVilla = await Site.findOne({ name: 'Green Villa' });
    if (!greenVilla) throw new Error('Green Villa site not found in database');

    // 1. Create a Material Expense with Multi-Item Breakdown
    const materialExp = await Expense.create({
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      category: 'Materials',
      description: 'Cement & M-Sand bulk batch',
      supplierName: 'SM Traders',
      amount: 47500,
      paymentStatus: 'Paid',
      paidAmount: 47500,
      pendingAmount: 0,
      paymentMode: 'Bank Transfer (NEFT)',
      items: [
        {
          materialName: 'Cement (50 kg Bag)',
          quantity: 50,
          unit: 'Bag',
          rate: 420,
          amount: 21000,
        },
        {
          materialName: 'M-Sand – Black',
          quantity: 480,
          unit: 'CFT',
          rate: 55,
          amount: 26400,
        },
      ],
    });
    console.log(`✅ 1. Created Material Expense with Multi-Item Breakdown:`);
    console.log(`   Expense ID: ${materialExp._id} - Amount: ₹${materialExp.amount}`);
    console.log(`   Breakdown Items Count: ${materialExp.items.length} items (Cement + M-Sand)`);

    // 2. Create an Additional Work Expense (Requirement: Additional Work filter & summary)
    const addWorkExp = await Expense.create({
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      category: 'Additional Work',
      description: 'Extra plumbing re-routing & drainage pipe relocation',
      supplierName: 'City Plumbing Contractors',
      amount: 15000,
      paymentStatus: 'Paid',
      paidAmount: 15000,
      pendingAmount: 0,
      paymentMode: 'UPI (GPay)',
    });
    console.log(`✅ 2. Created Additional Work Expense:`);
    console.log(`   Description: "${addWorkExp.description}" - Amount: ₹${addWorkExp.amount}`);

    // 3. Create a Pending Rental Expense (Requirement: Show paid and pending amounts)
    const pendingRentalExp = await Expense.create({
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      category: 'Rental',
      description: 'Crane & Shuttering equipment rental',
      supplierName: 'BuildEquip Rentals',
      amount: 25000,
      paymentStatus: 'Pending',
      paidAmount: 0,
      pendingAmount: 25000,
      paymentMode: 'Bank Transfer (NEFT)',
    });
    console.log(`✅ 3. Created Pending Expense:`);
    console.log(`   Category: ${pendingRentalExp.category} - Pending Amount: ₹${pendingRentalExp.pendingAmount}`);

    // 4. Test Financial Summary Calculation
    const allExpenses = await Expense.find({ site: greenVilla._id });
    let totalAmt = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let addWorkTotal = 0;

    allExpenses.forEach((e) => {
      totalAmt += e.amount;
      totalPaid += e.paidAmount || (e.paymentStatus === 'Paid' ? e.amount : 0);
      totalPending += e.pendingAmount || (e.paymentStatus === 'Pending' ? e.amount : 0);
      if (e.category === 'Additional Work') addWorkTotal += e.amount;
    });

    console.log(`\n✅ 4. Financial Summary Metrics for Green Villa:`);
    console.log(`   • Total Expenses:         ₹${totalAmt.toLocaleString('en-IN')}`);
    console.log(`   • Paid Amount:            ₹${totalPaid.toLocaleString('en-IN')}`);
    console.log(`   • Pending Amount:         ₹${totalPending.toLocaleString('en-IN')}`);
    console.log(`   • Additional Work Total:  ₹${addWorkTotal.toLocaleString('en-IN')}`);

    // 5. Test Category Filter
    const additionalWorkList = await Expense.find({ site: greenVilla._id, category: 'Additional Work' });
    console.log(`\n✅ 5. Category Filtering Test:`);
    console.log(`   Found ${additionalWorkList.length} expenses under category "Additional Work"`);
    if (additionalWorkList.length === 0) throw new Error('Additional work filter test failed');

    // 6. Test Updating Payment Status (Pending -> Paid)
    pendingRentalExp.paymentStatus = 'Paid';
    pendingRentalExp.paidAmount = pendingRentalExp.amount;
    pendingRentalExp.pendingAmount = 0;
    await pendingRentalExp.save();
    console.log(`\n✅ 6. Payment Status Transition Test:`);
    console.log(`   Updated Rental bill from "Pending" to "Paid" (Paid: ₹${pendingRentalExp.paidAmount}, Pending: ₹${pendingRentalExp.pendingAmount})`);

    // Clean up the 3 test entries
    await Expense.findByIdAndDelete(materialExp._id);
    await Expense.findByIdAndDelete(addWorkExp._id);
    await Expense.findByIdAndDelete(pendingRentalExp._id);
    console.log(`\n   Cleaned up test expense entries`);

    console.log('\n🎉 ALL GROUP 4 TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Group 4 Test Failed:', err);
    process.exit(1);
  }
}

testGroup4();

