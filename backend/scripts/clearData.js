const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Site = require('../src/models/Site');
const Expense = require('../src/models/Expense');
const Payment = require('../src/models/Payment');
const Labour = require('../src/models/Labour');
const LabourAttendance = require('../src/models/LabourAttendance');
const DailyUpdate = require('../src/models/DailyUpdate');
const Invoice = require('../src/models/Invoice');
const StockMovement = require('../src/models/StockMovement');

async function clearData() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'ksquare360';

    console.log(`Connecting to MongoDB (${dbName})...`);
    await mongoose.connect(mongoUri, { dbName });
    console.log('✅ Connected successfully!');

    // Clear transactional & test data
    const sitesRes = await Site.deleteMany({});
    const expensesRes = await Expense.deleteMany({});
    const paymentsRes = await Payment.deleteMany({});
    const labourRes = await Labour.deleteMany({});
    const attendanceRes = await LabourAttendance.deleteMany({});
    const dailyUpdatesRes = await DailyUpdate.deleteMany({});
    const invoicesRes = await Invoice.deleteMany({});
    const stockMovementsRes = await StockMovement.deleteMany({});

    console.log('🧹 Cleaned up database records:');
    console.log(` - Sites deleted: ${sitesRes.deletedCount}`);
    console.log(` - Expenses deleted: ${expensesRes.deletedCount}`);
    console.log(` - Payments deleted: ${paymentsRes.deletedCount}`);
    console.log(` - Labour deleted: ${labourRes.deletedCount}`);
    console.log(` - Attendance deleted: ${attendanceRes.deletedCount}`);
    console.log(` - Daily Updates deleted: ${dailyUpdatesRes.deletedCount}`);
    console.log(` - Invoices deleted: ${invoicesRes.deletedCount}`);
    console.log(` - Stock Movements deleted: ${stockMovementsRes.deletedCount}`);

    console.log('\n✨ Database is now completely clean and ready for real testing!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
}

clearData();

