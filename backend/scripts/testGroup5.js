const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Payment = require('../src/models/Payment');
const Labour = require('../src/models/Labour');
const LabourAttendance = require('../src/models/LabourAttendance');
const Site = require('../src/models/Site');

async function testGroup5() {
  try {
    console.log('🧪 Starting Group 5 (Payments & Labour Management) Integration Tests...\n');

    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME });
    console.log('✅ Connected to MongoDB Atlas');

    const greenVilla = await Site.findOne({ name: 'Green Villa' });
    if (!greenVilla) throw new Error('Green Villa site not found in database');

    // 1. Test Recording Client Payment (RECEIVED)
    const clientPayment = await Payment.create({
      flowType: 'RECEIVED',
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      partyName: 'Arun Kumar (Client)',
      category: 'Stage 2 Roof Slab Advance',
      amount: 200000, // 2 Lakhs test payment
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: `UTR-TEST-${Date.now().toString().slice(-6)}`,
      status: 'Cleared',
      notes: 'Received advance for slab casting',
    });
    console.log(`✅ 1. Client Payment Recorded (RECEIVED):`);
    console.log(`   Client: "${clientPayment.partyName}" - Amount: ₹${clientPayment.amount.toLocaleString('en-IN')} (Status: ${clientPayment.status})`);

    // 2. Test Recording Outgoing Vendor Disbursement (OUTGOING)
    const outgoingPayout = await Payment.create({
      flowType: 'OUTGOING',
      site: greenVilla._id,
      siteName: greenVilla.name,
      siteCode: greenVilla.code,
      partyName: 'SM Traders (Cement Supplier)',
      category: 'Materials Settlement',
      amount: 84000,
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: `NEFT-PAY-${Date.now().toString().slice(-6)}`,
      status: 'Paid',
      notes: 'Cement invoice clearance',
    });
    console.log(`✅ 2. Vendor Disbursement Recorded (OUTGOING):`);
    console.log(`   Beneficiary: "${outgoingPayout.partyName}" - Amount: ₹${outgoingPayout.amount.toLocaleString('en-IN')}`);

    // 3. Test Payments Summary (Net Operating Balance = Received - Outgoing)
    const allPayments = await Payment.find();
    let totalIn = 0;
    let totalOut = 0;
    allPayments.forEach((p) => {
      if (p.flowType === 'RECEIVED' && (p.status === 'Cleared' || p.status === 'Paid')) totalIn += p.amount;
      if (p.flowType === 'OUTGOING' && (p.status === 'Cleared' || p.status === 'Paid')) totalOut += p.amount;
    });
    const netBalance = totalIn - totalOut;

    console.log(`\n✅ 3. Payments Ledger Summary:`);
    console.log(`   • Total Client Received: ₹${totalIn.toLocaleString('en-IN')}`);
    console.log(`   • Total Outgoing Payouts: ₹${totalOut.toLocaleString('en-IN')}`);
    console.log(`   • Net Operating Cash:    ₹${netBalance.toLocaleString('en-IN')} ${netBalance >= 0 ? '(Positive Balance ✅)' : '(Deficit ❌)'}`);

    // 4. Test Labour Registration with KYC details
    const newWorker = await Labour.create({
      name: 'Ramu S',
      workerType: 'Mason',
      phone: '+91 98409 87654',
      address: '24 Anna Salai, Chennai',
      aadhaarNumber: '3829 4719 2847',
      panNumber: 'ABCDE9876K',
      dailyWage: 1000,
      overtimeRate: 150,
      status: 'Active',
      currentSite: greenVilla._id,
    });
    console.log(`\n✅ 4. Registered Labour Worker with KYC:`);
    console.log(`   Name: ${newWorker.name} (${newWorker.workerType})`);
    console.log(`   Aadhaar: ${newWorker.aadhaarNumber} | PAN: ${newWorker.panNumber}`);
    console.log(`   Daily Wage: ₹${newWorker.dailyWage}/day | OT Rate: ₹${newWorker.overtimeRate}/hr`);

    // 5. Test Recording Daily Attendance with Wage Calculation
    // Scenario: Present (₹1000) + 2 hours overtime (2 * ₹150 = ₹300) = Total ₹1300
    const otHours = 2;
    const earnedWage = newWorker.dailyWage + (otHours * newWorker.overtimeRate); // 1000 + 300 = 1300

    const attendanceLog = await LabourAttendance.create({
      labour: newWorker._id,
      workerName: newWorker.name,
      workerType: newWorker.workerType,
      site: greenVilla._id,
      siteName: greenVilla.name,
      status: 'Present',
      dailyWage: newWorker.dailyWage,
      overtimeHours: otHours,
      overtimeRate: newWorker.overtimeRate,
      totalWageEarned: earnedWage,
      notes: 'Foundation column concrete pouring',
    });

    console.log(`\n✅ 5. Attendance & Wage Calculation Test:`);
    console.log(`   Status: ${attendanceLog.status} (Base: ₹${attendanceLog.dailyWage})`);
    console.log(`   Overtime: ${attendanceLog.overtimeHours} hrs @ ₹${attendanceLog.overtimeRate}/hr = ₹${attendanceLog.overtimeHours * attendanceLog.overtimeRate}`);
    console.log(`   Total Wage Earned: ₹${attendanceLog.totalWageEarned} (Verified: ₹1,000 + ₹300 = ₹1,300)`);
    if (attendanceLog.totalWageEarned !== 1300) throw new Error('Wage calculation mismatch');

    // 6. Test Weekly Wage Summary
    const wageLogs = await LabourAttendance.find({ site: greenVilla._id });
    const totalWages = wageLogs.reduce((sum, w) => sum + w.totalWageEarned, 0);
    console.log(`\n✅ 6. Site Wage Summary: Total recorded wages for Green Villa: ₹${totalWages.toLocaleString('en-IN')}`);

    // Clean up test entries
    await Payment.findByIdAndDelete(clientPayment._id);
    await Payment.findByIdAndDelete(outgoingPayout._id);
    await LabourAttendance.findByIdAndDelete(attendanceLog._id);
    await Labour.findByIdAndDelete(newWorker._id);
    console.log(`\n   Cleaned up test records`);

    console.log('\n🎉 ALL GROUP 5 TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Group 5 Test Failed:', err);
    process.exit(1);
  }
}

testGroup5();

