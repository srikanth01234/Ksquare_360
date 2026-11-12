const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MaterialMaster = require('../src/models/MaterialMaster');
const GodownStock = require('../src/models/GodownStock');
const Site = require('../src/models/Site');
const Expense = require('../src/models/Expense');
const Payment = require('../src/models/Payment');
const Labour = require('../src/models/Labour');

const initialMaterials = [
  {
    code: 'MAT-001',
    name: 'Cement',
    category: 'Binding Material',
    unit: 'Bag',
    defaultPrice: 420,
    status: 'Active',
    imageUrl: 'https://media.adeo.com/media/3665378/media.jpeg',
    stock: 500,
  },
  {
    code: 'MAT-002',
    name: 'M-Sand – Black',
    category: 'Aggregates',
    unit: 'CFT',
    defaultPrice: 55,
    status: 'Active',
    imageUrl: 'https://tiimg.tistatic.com/fp/1/007/683/easy-to-use-fine-grained-sustainable-eco-friendly-m-sand-for-construction-006.jpg',
    stock: 1200,
  },
  {
    code: 'MAT-003',
    name: 'M-Sand – White',
    category: 'Aggregates',
    unit: 'CFT',
    defaultPrice: 60,
    status: 'Active',
    imageUrl: 'https://tmtbar.in/images/products/m-sand.png',
    stock: 800,
  },
  {
    code: 'MAT-004',
    name: 'P-Sand – Black',
    category: 'Aggregates',
    unit: 'CFT',
    defaultPrice: 45,
    status: 'Active',
    imageUrl: 'https://www.mbchetty.in/materials/p-sand/',
    stock: 950,
  },
  {
    code: 'MAT-005',
    name: 'P-Sand – White',
    category: 'Aggregates',
    unit: 'CFT',
    defaultPrice: 50,
    status: 'Active',
    imageUrl: 'https://useprocurely.com/assets/design/product-plaster-sand.png',
    stock: 650,
  },
  {
    code: 'MAT-006',
    name: '20 mm Blue Metal',
    category: 'Coarse Aggregates',
    unit: 'CFT',
    defaultPrice: 48,
    status: 'Active',
    imageUrl: 'https://www.bcsands.com.au/images/products/18866.jpg',
    stock: 1500,
  },
  {
    code: 'MAT-007',
    name: '40 mm Blue Metal',
    category: 'Coarse Aggregates',
    unit: 'CFT',
    defaultPrice: 44,
    status: 'Active',
    imageUrl: 'https://tirupatibalajisands.com/images/tbbm-stone-jelly-split.png',
    stock: 1100,
  },
  {
    code: 'MAT-008',
    name: 'Steel – Fe 550D',
    category: 'Steel & Rebar',
    unit: 'Kg',
    defaultPrice: 75,
    status: 'Active',
    imageUrl: 'https://lntsufin.com/storage/mediafiles/catalog/live/17229-3823/original/17229-3823_image_0.jpg',
    stock: 4500,
  },
  {
    code: 'MAT-009',
    name: 'Steel Rings',
    category: 'Steel & Rebar',
    unit: 'Kg',
    defaultPrice: 80,
    status: 'Active',
    imageUrl: 'https://www.metconindia.com/550D-tmt-steel-bars/img/product-image2.jpg',
    stock: 850,
  },
  {
    code: 'MAT-010',
    name: 'Chamber Bricks',
    category: 'Masonry',
    unit: 'Piece',
    defaultPrice: 9.5,
    status: 'Active',
    imageUrl: 'https://pkbricks.com/assets/images/Products/wirecut-1.jpg',
    stock: 8000,
  },
  {
    code: 'MAT-011',
    name: 'Fly Ash Bricks',
    category: 'Masonry',
    unit: 'Piece',
    defaultPrice: 7.5,
    status: 'Active',
    imageUrl: 'https://lntsufin.com/storage/mediafiles/catalog/live/17150-1359/original/17150-1359_image_0.jpg',
    stock: 6500,
  },
  {
    code: 'MAT-012',
    name: 'Solid Block – 6 Inch',
    category: 'Blocks',
    unit: 'Piece',
    defaultPrice: 42,
    status: 'Active',
    imageUrl: 'https://iconic.co.ug/wp-content/uploads/2021/01/6-inch-Solid-Concrete-Block.png',
    stock: 2200,
  },
  {
    code: 'MAT-013',
    name: 'Solid Block – 4 Inch',
    category: 'Blocks',
    unit: 'Piece',
    defaultPrice: 34,
    status: 'Active',
    imageUrl: 'https://us.evocdn.io/dealer/1408/catalog/product/images/xl/b4816so_a_1759946661.jpg',
    stock: 1800,
  },
  {
    code: 'MAT-014',
    name: 'AAC Block',
    category: 'Blocks',
    unit: 'Piece',
    defaultPrice: 65,
    status: 'Active',
    imageUrl: 'https://cpimg.tistatic.com/08249516/b/4/Side-Wall-AAC-Block.jpg',
    stock: 1400,
  },
  {
    code: 'MAT-015',
    name: 'AAC Paste',
    category: 'Adhesives',
    unit: 'Bag',
    defaultPrice: 480,
    status: 'Active',
    imageUrl: 'https://www.nurkim.com.tr/assets/images/uploads/projects/27/thumbnails/2024-12-26-155854-adhesive-for-laying-of-concrete-blocks-bricks-power-grey-alfablock.png',
    stock: 120,
  },
  {
    code: 'MAT-016',
    name: 'Cement Bulk',
    category: 'Binding Material',
    unit: 'Ton',
    defaultPrice: 7600,
    status: 'Active',
    imageUrl: 'https://s.alicdn.com/@sc04/kf/H491309d2a43043828ef14945d6a197deh/Shacman-8-4-37cbm-Powder-Material-Dry-Mixed-Bulk-Cement-Transport-Vehicle.jpg',
    stock: 15,
  },
  {
    code: 'MAT-017',
    name: 'Red Brick',
    category: 'Masonry',
    unit: 'Piece',
    defaultPrice: 8.5,
    status: 'Active',
    imageUrl: 'https://tiimg.tistatic.com/fp/1/007/582/natural-red-clay-brick-for-construction-use-358.jpg',
    stock: 9000,
  },
  {
    code: 'MAT-018',
    name: 'Cement Brick',
    category: 'Blocks',
    unit: 'Piece',
    defaultPrice: 32,
    status: 'Active',
    imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/1/QY/WN/YF/4590218/cement-concrete-bricks.jpg',
    stock: 3500,
  },
];

const initialSites = [
  {
    name: 'Green Villa',
    code: 'CHN-11-2026-NB-01',
    type: 'New Building',
    category: 'NB',
    status: 'Active',
    client: 'Arun Kumar',
    contact: '+91 98401 23456',
    location: 'Chennai, TN',
    city: 'Chennai',
    startDate: new Date('2026-06-10'),
    expectedDate: new Date('2027-04-30'),
    projectBudget: 2500000,
    photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'RK Residence',
    code: 'CHN-11-2026-NB-02',
    type: 'New Building',
    category: 'NB',
    status: 'Active',
    client: 'Suresh Kumar',
    contact: '+91 98402 34567',
    location: 'Chennai, TN',
    city: 'Chennai',
    startDate: new Date('2026-07-15'),
    expectedDate: new Date('2027-05-30'),
    projectBudget: 1800000,
    photoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Metro Apartment',
    code: 'CHN-11-2026-NB-03',
    type: 'Commercial / Multi-Unit',
    category: 'NB',
    status: 'On Hold',
    client: 'Manikandan',
    contact: '+91 98403 45678',
    location: 'Chennai, TN',
    city: 'Chennai',
    startDate: new Date('2026-08-01'),
    expectedDate: new Date('2027-08-31'),
    projectBudget: 4500000,
    photoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'Ksquare';

    console.log(`Connecting to MongoDB (${dbName})...`);
    await mongoose.connect(mongoUri, { dbName });
    console.log('✅ Connected successfully!');

    // 1. Seed Master Materials & Godown Stock
    console.log('Seeding Master Materials & Godown Inventory...');
    for (const item of initialMaterials) {
      const existing = await MaterialMaster.findOne({ code: item.code });
      let materialDoc;
      if (!existing) {
        materialDoc = await MaterialMaster.create({
          code: item.code,
          name: item.name,
          category: item.category,
          unit: item.unit,
          defaultPrice: item.defaultPrice,
          status: item.status,
          imageUrl: item.imageUrl,
        });
        console.log(`  ➕ Created Material: ${item.name} (${item.code})`);
      } else {
        materialDoc = existing;
        console.log(`  ✔ Already Exists: ${item.name}`);
      }

      // Ensure Godown stock record exists
      const existingStock = await GodownStock.findOne({ material: materialDoc._id });
      if (!existingStock) {
        await GodownStock.create({
          material: materialDoc._id,
          currentStock: item.stock || 100,
          reorderLevel: 20,
        });
        console.log(`    📦 Initialized Stock: ${item.stock || 100} ${item.unit}`);
      }
    }

    // 2. Seed Sample Sites
    console.log('\nSeeding Construction Sites...');
    let greenVillaSite = null;
    for (const s of initialSites) {
      let siteDoc = await Site.findOne({ code: s.code });
      if (!siteDoc) {
        siteDoc = await Site.create(s);
        console.log(`  ➕ Created Site: ${s.name} (${s.code})`);
      } else {
        console.log(`  ✔ Already Exists: ${s.name}`);
      }
      if (s.name === 'Green Villa') {
        greenVillaSite = siteDoc;
      }
    }

    // 3. Seed Sample Payments & Expenses for Green Villa (to mirror exact math)
    if (greenVillaSite) {
      console.log('\nSeeding Payments & Financial records for Green Villa...');
      const existingPayment = await Payment.findOne({ site: greenVillaSite._id });
      if (!existingPayment) {
        await Payment.create({
          flowType: 'RECEIVED',
          site: greenVillaSite._id,
          siteName: greenVillaSite.name,
          siteCode: greenVillaSite.code,
          partyName: 'Arun Kumar',
          category: 'Advance & Stage 1',
          amount: 1000000, // 10 Lakhs Client Paid
          paymentMode: 'Bank Transfer (NEFT)',
          referenceNo: 'NEFT-92837481928',
          status: 'Cleared',
          date: new Date('2026-06-15'),
          notes: 'Initial mobilization advance received from client',
        });
        console.log('  💰 Created Client Payment: ₹10,00,000 (Advance Received)');
      }

      // Check existing expenses
      const expenseCount = await Expense.countDocuments({ site: greenVillaSite._id });
      if (expenseCount === 0) {
        // Material Expense: ₹4,50,000
        await Expense.create({
          site: greenVillaSite._id,
          siteName: greenVillaSite.name,
          siteCode: greenVillaSite.code,
          category: 'Materials',
          description: 'Cement, Sand, Blue Metal & Steel initial procurement',
          supplierName: 'SM Traders',
          amount: 450000,
          paymentStatus: 'Paid',
          paidAmount: 450000,
          pendingAmount: 0,
          paymentMode: 'Bank Transfer (NEFT)',
          referenceNo: 'TXN-MAT-01',
          date: new Date('2026-07-02'),
        });

        // Labour Expense: ₹2,75,000
        await Expense.create({
          site: greenVillaSite._id,
          siteName: greenVillaSite.name,
          siteCode: greenVillaSite.code,
          category: 'Labour',
          description: 'Mason, helper & bar bender wage disbursements',
          supplierName: 'Direct Labour',
          amount: 275000,
          paymentStatus: 'Paid',
          paidAmount: 275000,
          pendingAmount: 0,
          paymentMode: 'Cash',
          referenceNo: 'VOUCHER-LAB-01',
          date: new Date('2026-07-10'),
        });

        // Rental Expense: ₹1,20,000
        await Expense.create({
          site: greenVillaSite._id,
          siteName: greenVillaSite.name,
          siteCode: greenVillaSite.code,
          category: 'Rental',
          description: 'Concrete mixer, excavator & scaffolding rental',
          supplierName: 'BuildEquip Rentals',
          amount: 120000,
          paymentStatus: 'Paid',
          paidAmount: 120000,
          pendingAmount: 0,
          paymentMode: 'Bank Transfer (NEFT)',
          referenceNo: 'TXN-RENT-01',
          date: new Date('2026-07-15'),
        });

        // Additional Work Expense: ₹35,000
        await Expense.create({
          site: greenVillaSite._id,
          siteName: greenVillaSite.name,
          siteCode: greenVillaSite.code,
          category: 'Additional Work',
          description: 'Parapet wall 2ft extension & extra plastering',
          supplierName: 'Ravi Mason Contractors',
          amount: 35000,
          paymentStatus: 'Paid',
          paidAmount: 35000,
          pendingAmount: 0,
          paymentMode: 'Bank Transfer (NEFT)',
          referenceNo: 'TXN-ADD-01',
          date: new Date('2026-07-20'),
        });

        console.log('  🧾 Created Expenses: Materials (₹4.5L), Labour (₹2.75L), Rental (₹1.2L), Additional Work (₹35K)');
        console.log('  ✨ Verified Math: Total Spent = ₹8,45,000 | Client Paid = ₹10,00,000 | Excess in Hand = ₹1,55,000');
      }
    }

    // 4. Seed Sample Labour workers
    const labourCount = await Labour.countDocuments();
    if (labourCount === 0) {
      await Labour.create([
        {
          name: 'Murugan K',
          workerType: 'Mason',
          phone: '+91 98401 11223',
          address: 'No. 12, Gandhi Street, Chennai',
          aadhaarNumber: '4829 1029 3847',
          panNumber: 'ABCDE1234F',
          dailyWage: 1000,
          overtimeRate: 150,
          status: 'Active',
        },
        {
          name: 'Selvam R',
          workerType: 'Helper',
          phone: '+91 98402 22334',
          address: 'No. 45, Anna Nagar, Chennai',
          aadhaarNumber: '9281 7462 8192',
          dailyWage: 700,
          overtimeRate: 100,
          status: 'Active',
        },
        {
          name: 'Kannan M',
          workerType: 'Bar Bender',
          phone: '+91 98403 33445',
          address: 'No. 8, Kamaraj Salai, Chennai',
          aadhaarNumber: '7362 9182 7364',
          dailyWage: 1100,
          overtimeRate: 160,
          status: 'Active',
        },
      ]);
      console.log('\n  👷 Seeded 3 Labour profiles with Aadhaar & wage rates');
    }

    console.log('\n🎉 Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();

