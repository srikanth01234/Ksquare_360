const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const models = [
  require('../models/Site'),
  require('../models/Expense'),
  require('../models/Labour'),
  require('../models/LabourAttendance'),
  require('../models/Payment'),
  require('../models/Invoice'),
  require('../models/DailyUpdate'),
  require('../models/MaterialMaster'),
  require('../models/GodownStock'),
  require('../models/StockMovement'),
];

async function init() {
  await connectDB();
  console.log('Creating collections in MongoDB Atlas if not existing...');
  for (const model of models) {
    try {
      await model.createCollection();
      console.log(`✅ Collection ensured: ${model.collection.name}`);
    } catch (err) {
      console.log(`ℹ️ Collection ${model.collection.name}: ${err.message}`);
    }
  }

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n📁 Active Collections in ksquare360:');
  collections.forEach((c) => console.log(`  - ${c.name}`));

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

init();
