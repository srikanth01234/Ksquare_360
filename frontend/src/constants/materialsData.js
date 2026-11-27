// Master Materials Catalogue & Variant/Unit Configurations for K Square Construction Management

export const MATERIAL_VARIANTS_CONFIG = {
  Cement: {
    units: ['Bags', 'Kg'],
    types: ['OPC 53 Grade', 'OPC 43 Grade', 'PPC'],
    sizes: [],
    brands: ['UltraTech', 'Ramco', 'Dalmia', 'Coromandel', 'Chettinad', 'ACC', 'Other'],
  },
  Sand: {
    units: ['Tonnes', 'Cubic Feet'],
    types: ['M-Sand – Black', 'M-Sand – White', 'P-Sand – Black', 'P-Sand – White', 'River Sand'],
    sizes: [],
    brands: [],
  },
  Aggregate: {
    units: ['Tonnes', 'Cubic Feet'],
    types: ['Blue Metal', 'Crushed Stone', 'GSB / Wet Mix'],
    sizes: ['10 mm', '12 mm', '20 mm', '40 mm'],
    brands: [],
  },
  Steel: {
    units: ['Kg', 'Tonnes'],
    types: ['Fe 550D TMT', 'Fe 500D TMT', 'Binding Wire'],
    sizes: ['6 mm', '8 mm', '10 mm', '12 mm', '16 mm', '20 mm', '25 mm', '32 mm'],
    brands: ['JSW', 'TATA Tiscon', 'SAIL', 'Vizag Steel', 'ARS', 'Other'],
  },
  Rings: {
    units: ['Kg', 'Pieces'],
    types: ['Column Stirrups', 'Beam Stirrups'],
    sizes: ['4x8 inch', '6x6 inch', '6x9 inch', '7x7 inch', '8x8 inch'],
    brands: [],
  },
  Bricks: {
    units: ['Numbers', 'Pieces'],
    types: ['Red Bricks', 'Fly Ash Bricks', 'Chamber Bricks', 'Wire-Cut Bricks', 'Cement Bricks'],
    sizes: [],
    brands: [],
  },
  'Solid Blocks': {
    units: ['Numbers', 'Pieces'],
    types: ['Concrete Solid Block', 'Hollow Block'],
    sizes: ['4 inch', '6 inch', '8 inch'],
    brands: [],
  },
  'AAC Blocks': {
    units: ['Numbers', 'Pieces'],
    types: [],
    sizes: ['4 inch', '6 inch', '8 inch', '9 inch'],
    brands: ['Renacon', 'Siporex', 'Meghalite', 'Aerocon', 'UltraTech Xtralite', 'Other'],
  },
  'AAC Paste': {
    units: ['Bags', 'Kg'],
    types: ['Block Jointing Mortar'],
    sizes: [],
    brands: ['Renacon', 'UltraTech Fixoblock', 'Weber', 'MYK Laticrete', 'Other'],
  },
};

/**
 * Resolve consolidated parent material name for legacy split material records
 */
export function getConsolidatedMaterialName(name = '', category = '') {
  const n = String(name).toLowerCase().trim();
  const c = String(category).toLowerCase().trim();

  if (n.includes('cement') && !n.includes('brick')) return 'Cement';
  if (n.includes('m-sand') || n.includes('p-sand') || n.includes('river sand') || c === 'sand') return 'Sand';
  if (n.includes('blue metal') || n.includes('aggregate') || n.includes('jelly') || c === 'aggregates') return 'Aggregate';
  if (n.includes('ring')) return 'Rings';
  if (n.includes('steel') || n.includes('tmt') || c === 'steel') return 'Steel';
  if (n.includes('aac') && n.includes('paste')) return 'AAC Paste';
  if (n.includes('aac')) return 'AAC Blocks';
  if (n.includes('solid block') || n.includes('hollow block')) return 'Solid Blocks';
  if (n.includes('brick') || c === 'bricks') return 'Bricks';

  return name || 'Material';
}

/**
 * Get industry-standard measurement units & variant options for a material
 */
export function getMaterialConfig(materialName = '', category = '', fallbackUnit = 'Units') {
  const consolidated = getConsolidatedMaterialName(materialName, category);
  const matched = MATERIAL_VARIANTS_CONFIG[consolidated];
  if (matched) return matched;

  return {
    units: fallbackUnit ? [fallbackUnit, 'Numbers', 'Pieces', 'Bags', 'Kg', 'Tonnes', 'Cubic Feet'].filter((v, i, a) => a.indexOf(v) === i) : ['Numbers', 'Kg', 'Bags'],
    types: [],
    sizes: [],
    brands: [],
  };
}

export const INITIAL_MATERIALS = [
  {
    id: 'MAT-001',
    name: 'Cement',
    category: 'Cement',
    unit: 'Bags',
    price: 420,
    stock: 350,
    availableQuantity: 350,
    totalPurchased: 500,
    totalIssued: 150,
    minStock: 50,
    minStockLevel: 50,
    status: 'Active',
    image: 'https://media.adeo.com/media/3665378/media.jpeg',
    description: 'Grade 53 OPC/PPC standard cement bags for structural and masonry works.',
  },
  {
    id: 'MAT-002',
    name: 'Sand',
    category: 'Sand',
    unit: 'Tonnes',
    price: 1200,
    stock: 180,
    availableQuantity: 180,
    totalPurchased: 445,
    totalIssued: 265,
    minStock: 30,
    minStockLevel: 30,
    status: 'Active',
    image: 'https://tiimg.tistatic.com/fp/1/007/683/easy-to-use-fine-grained-sustainable-eco-friendly-m-sand-for-construction-006.jpg',
    description: 'Manufactured M-Sand, P-Sand (Black & White), and River Sand for RCC & plastering.',
  },
  {
    id: 'MAT-003',
    name: 'Aggregate',
    category: 'Aggregates',
    unit: 'Tonnes',
    price: 1400,
    stock: 53,
    availableQuantity: 53,
    totalPurchased: 155,
    totalIssued: 102,
    minStock: 20,
    minStockLevel: 20,
    status: 'Active',
    image: 'https://www.bcsands.com.au/images/products/18866.jpg',
    description: '10mm, 20mm, and 40mm blue granite gravel aggregate for RCC slab casting and foundations.',
  },
  {
    id: 'MAT-004',
    name: 'Steel',
    category: 'Steel',
    unit: 'Kg',
    price: 75,
    stock: 3300,
    availableQuantity: 3300,
    totalPurchased: 8500,
    totalIssued: 5200,
    minStock: 1000,
    minStockLevel: 1000,
    status: 'Active',
    image: 'https://lntsufin.com/storage/mediafiles/catalog/live/17229-3823/original/17229-3823_image_0.jpg',
    description: 'Fe 550D / Fe 500D TMT reinforcement steel bars (6mm to 32mm).',
  },
  {
    id: 'MAT-005',
    name: 'Rings',
    category: 'Steel',
    unit: 'Kg',
    price: 82,
    stock: 450,
    availableQuantity: 450,
    totalPurchased: 1200,
    totalIssued: 750,
    minStock: 150,
    minStockLevel: 150,
    status: 'Active',
    image: 'https://www.metconindia.com/550D-tmt-steel-bars/img/product-image2.jpg',
    description: 'Pre-fabricated steel stirrups for column and beam reinforcement.',
  },
  {
    id: 'MAT-006',
    name: 'Bricks',
    category: 'Bricks',
    unit: 'Numbers',
    price: 8,
    stock: 9300,
    availableQuantity: 9300,
    totalPurchased: 14500,
    totalIssued: 5200,
    minStock: 2500,
    minStockLevel: 2500,
    status: 'Active',
    image: 'https://pkbricks.com/assets/images/Products/wirecut-1.jpg',
    description: 'Red Bricks, Fly Ash Bricks, Chamber Bricks, and Wire-Cut Bricks for masonry.',
  },
  {
    id: 'MAT-007',
    name: 'Solid Blocks',
    category: 'Blocks',
    unit: 'Numbers',
    price: 42,
    stock: 2600,
    availableQuantity: 2600,
    totalPurchased: 5400,
    totalIssued: 2800,
    minStock: 800,
    minStockLevel: 800,
    status: 'Active',
    image: 'https://iconic.co.ug/wp-content/uploads/2021/01/6-inch-Solid-Concrete-Block.png',
    description: '4-inch, 6-inch, and 8-inch high-density concrete solid masonry blocks.',
  },
  {
    id: 'MAT-008',
    name: 'AAC Blocks',
    category: 'Blocks',
    unit: 'Numbers',
    price: 65,
    stock: 900,
    availableQuantity: 900,
    totalPurchased: 2500,
    totalIssued: 1600,
    minStock: 300,
    minStockLevel: 300,
    status: 'Active',
    image: 'https://cpimg.tistatic.com/08249516/b/4/Side-Wall-AAC-Block.jpg',
    description: 'Autoclaved Aerated Lightweight Concrete blocks (4", 6", 8", 9") for thermal insulation.',
  },
  {
    id: 'MAT-009',
    name: 'AAC Paste',
    category: 'Paste',
    unit: 'Bags',
    price: 380,
    stock: 60,
    availableQuantity: 60,
    totalPurchased: 150,
    totalIssued: 90,
    minStock: 20,
    minStockLevel: 20,
    status: 'Active',
    image: 'https://www.nurkim.com.tr/assets/images/uploads/projects/27/thumbnails/2024-12-26-155854-adhesive-for-laying-of-concrete-blocks-bricks-power-grey-alfablock.png',
    description: 'Polymer modified thin bed jointing mortar adhesive for AAC blocks.',
  },
];
