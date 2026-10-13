import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env.js';
import { RAW_PAN_INDIA_MANDI_RECORDS } from '../data/panIndiaMandiData.js';

export interface MemoryDb {
  users: any[];
  roles: any[];
  user_roles: any[];
  refresh_token_sessions: any[];
  password_reset_tokens: any[];
  email_verification_tokens: any[];
  oauth_accounts: any[];
  oauth_login_codes: any[];
  states: any[];
  districts: any[];
  taluks: any[];
  addresses: any[];
  categories: any[];
  products: any[];
  product_images: any[];
  product_location_snapshots: any[];
  inventory: any[];
  commodities: any[];
  markets: any[];
  market_prices: any[];
  crop_info: any[];
  crop_info_common_diseases: any[];
  crop_info_uses: any[];
  orders: any[];
  order_items: any[];
  order_address_snapshots: any[];
  payments: any[];
  payment_transactions: any[];
  deliveries: any[];
  phone_otps: any[];
  negotiations: any[];
  buyer_demands: any[];
  demand_bids: any[];
}

export const memoryDb: MemoryDb = {
  users: [],
  roles: [],
  user_roles: [],
  refresh_token_sessions: [],
  password_reset_tokens: [],
  email_verification_tokens: [],
  oauth_accounts: [],
  oauth_login_codes: [],
  states: [],
  districts: [],
  taluks: [],
  addresses: [],
  categories: [],
  products: [],
  product_images: [],
  product_location_snapshots: [],
  inventory: [],
  commodities: [],
  markets: [],
  market_prices: [],
  crop_info: [],
  crop_info_common_diseases: [],
  crop_info_uses: [],
  orders: [],
  order_items: [],
  order_address_snapshots: [],
  payments: [],
  payment_transactions: [],
  deliveries: [],
  phone_otps: [],
  negotiations: [],
  buyer_demands: [],
  demand_bids: [],
};

let initialized = false;

export async function initMemoryStore(): Promise<void> {
  if (initialized) return;
  initialized = true;

  console.log('[MemoryDb] Initializing in-memory mock database store with master data...');

  // 1. Roles
  const roleAdmin = { id: 'role-admin-id', name: 'ROLE_ADMIN', created_date: new Date(), last_modified_date: new Date() };
  const roleUser = { id: 'role-user-id', name: 'ROLE_USER', created_date: new Date(), last_modified_date: new Date() };
  memoryDb.roles.push(roleAdmin, roleUser);

  // 2. Initial Admin User
  const adminPasswordHash = await bcrypt.hash(ENV.INITIAL_ADMIN_PASSWORD || 'Admin@123', 10);
  const adminId = '38b5459e-f2de-4f86-be60-f0bd926020ec';
  const adminUser = {
    id: adminId,
    email: ENV.INITIAL_ADMIN_EMAIL || 'admin@agrimarket.com',
    password: adminPasswordHash,
    full_name: 'System Administrator',
    phone_number: ENV.INITIAL_ADMIN_PHONE || '9876543210',
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    is_email_verified: true,
    is_phone_verified: true,
    is_account_non_locked: true,
    failed_login_attempts: 0,
    temporary_locked_until: null,
    created_date: new Date(),
    last_modified_date: new Date(),
    password_updated_at: new Date(),
  };
  memoryDb.users.push(adminUser);
  memoryDb.user_roles.push(
    { user_id: adminId, role_id: roleAdmin.id },
    { user_id: adminId, role_id: roleUser.id }
  );

  // Demo Farmer/User
  const userPasswordHash = await bcrypt.hash('User@123', 10);
  const userId = '11111111-2222-3333-4444-555555555555';
  const normalUser = {
    id: userId,
    email: 'user@agrimarket.com',
    password: userPasswordHash,
    full_name: 'Ramesh Gowda',
    phone_number: '9845012345',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    is_email_verified: true,
    is_phone_verified: true,
    is_account_non_locked: true,
    failed_login_attempts: 0,
    temporary_locked_until: null,
    created_date: new Date(),
    last_modified_date: new Date(),
    password_updated_at: new Date(),
  };
  memoryDb.users.push(normalUser);
  memoryDb.user_roles.push({ user_id: userId, role_id: roleUser.id });

  // 3. States, Districts, Taluks
  const stateKA = {
    id: 'state-karnataka',
    name: 'Karnataka',
    code: 'KA',
    created_date: new Date(),
    last_modified_date: new Date(),
  };
  memoryDb.states.push(stateKA);

  const districtsKA = [
    { id: 'dist-bengaluru-u', name: 'Bengaluru Urban', code: 'BLRU', state_id: stateKA.id },
    { id: 'dist-bengaluru-r', name: 'Bengaluru Rural', code: 'BLRR', state_id: stateKA.id },
    { id: 'dist-mysuru', name: 'Mysuru', code: 'MYS', state_id: stateKA.id },
    { id: 'dist-mandya', name: 'Mandya', code: 'MAN', state_id: stateKA.id },
    { id: 'dist-hassan', name: 'Hassan', code: 'HAS', state_id: stateKA.id },
    { id: 'dist-dharwad', name: 'Dharwad', code: 'DHA', state_id: stateKA.id },
    { id: 'dist-belagavi', name: 'Belagavi', code: 'BEL', state_id: stateKA.id },
  ];
  memoryDb.districts.push(...districtsKA.map(d => ({ ...d, created_date: new Date(), last_modified_date: new Date() })));

  const taluksKA = [
    { id: 'taluk-bengaluru-north', name: 'Bengaluru North', district_id: 'dist-bengaluru-u' },
    { id: 'taluk-bengaluru-south', name: 'Bengaluru South', district_id: 'dist-bengaluru-u' },
    { id: 'taluk-anekal', name: 'Anekal', district_id: 'dist-bengaluru-u' },
    { id: 'taluk-devanahalli', name: 'Devanahalli', district_id: 'dist-bengaluru-r' },
    { id: 'taluk-nelamangala', name: 'Nelamangala', district_id: 'dist-bengaluru-r' },
    { id: 'taluk-mysuru', name: 'Mysuru', district_id: 'dist-mysuru' },
    { id: 'taluk-hunsur', name: 'Hunsur', district_id: 'dist-mysuru' },
    { id: 'taluk-nanjangud', name: 'Nanjangud', district_id: 'dist-mysuru' },
    { id: 'taluk-mandya', name: 'Mandya', district_id: 'dist-mandya' },
    { id: 'taluk-maddur', name: 'Maddur', district_id: 'dist-mandya' },
    { id: 'taluk-srirangapatna', name: 'Srirangapatna', district_id: 'dist-mandya' },
  ];
  memoryDb.taluks.push(...taluksKA.map(t => ({ ...t, created_date: new Date(), last_modified_date: new Date() })));

  // 4. Default Addresses
  const sampleAddress = {
    id: 'addr-sample-1',
    user_id: adminId,
    address_line1: 'Farmhouse #42, Devanahalli Main Road',
    address_line2: 'Near International Airport',
    landmark: 'Behind Agri Research Center',
    taluk_id: 'taluk-devanahalli',
    pin_code: '562110',
    latitude: 13.2483,
    longitude: 77.7126,
    is_default: true,
    created_date: new Date(),
    last_modified_date: new Date(),
  };
  memoryDb.addresses.push(sampleAddress);

  // 5. Categories
  const categoryNames = [
    { name: 'Seeds', desc: 'Certified high-yield hybrid & organic seeds' },
    { name: 'Fertilizers', desc: 'Bio-fertilizers, urea, NPK blends & organic manure' },
    { name: 'Pesticides', desc: 'Crop protection solutions & eco-friendly pest repellents' },
    { name: 'Harvested Products', desc: 'Fresh farm harvests ready for delivery' },
    { name: 'Pre-Harvested Products', desc: 'Crops scheduled for forward-contract harvesting' },
    { name: 'Farm Equipment', desc: 'Sprayers, tillers, irrigation drip kits & farm tools' },
  ];

  for (const cat of categoryNames) {
    memoryDb.categories.push({
      id: uuidv4(),
      name: cat.name,
      description: cat.desc,
      icon_url: null,
      created_date: new Date(),
      last_modified_date: new Date(),
    });
  }

  // 6. Products, Inventory & Images
  const seedCat = memoryDb.categories.find(c => c.name === 'Seeds');
  const fertCat = memoryDb.categories.find(c => c.name === 'Fertilizers');
  const harvestCat = memoryDb.categories.find(c => c.name === 'Harvested Products');

  const sampleProducts = [
    {
      id: 'prod-sona-masoori-seed',
      category_id: seedCat?.id || 'cat-seeds',
      seller_id: adminId,
      name: 'Organic Sona Masoori Paddy Seeds',
      description: 'Certified premium grade Sona Masoori paddy seeds with 95% germination rate and disease resistance.',
      price_per_unit: 1450,
      unit: 'BAG (25KG)',
      status: 'ACTIVE',
      quantity: 120,
      reserved: 5,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'prod-organic-neem-fert',
      category_id: fertCat?.id || 'cat-fert',
      seller_id: adminId,
      name: 'Pure Neem Cake Organic Fertilizer',
      description: 'Slow-release soil conditioner enriched with Azadirachtin to protect roots against nematodes while enriching nitrogen.',
      price_per_unit: 850,
      unit: 'BAG (50KG)',
      status: 'ACTIVE',
      quantity: 80,
      reserved: 2,
      imageUrl: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'prod-fresh-shimoga-arecanut',
      category_id: harvestCat?.id || 'cat-harvest',
      seller_id: adminId,
      name: 'Premium Shimoga Red Arecanut (Rashi)',
      description: 'Sun-dried high quality whole betel nut selected directly from Malnad plantations.',
      price_per_unit: 480,
      unit: 'KG',
      status: 'ACTIVE',
      quantity: 500,
      reserved: 10,
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'prod-alphonso-mango-harvest',
      category_id: harvestCat?.id || 'cat-harvest',
      seller_id: adminId,
      name: 'Dharwad Alphonso Mangoes (Organic Farm Pick)',
      description: 'Naturally ripened carbide-free Alphonso mangoes celebrated for exquisite sweetness and aroma.',
      price_per_unit: 650,
      unit: 'DOZEN',
      status: 'ACTIVE',
      quantity: 40,
      reserved: 0,
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    },
  ];

  for (const p of sampleProducts) {
    const prodRecord = {
      id: p.id,
      category_id: p.category_id,
      farmer_id: p.seller_id,
      seller_id: p.seller_id,
      name: p.name,
      description: p.description,
      price: p.price_per_unit,
      price_per_unit: p.price_per_unit,
      unit: p.unit,
      status: p.status,
      created_date: new Date(),
      last_modified_date: new Date(),
    };
    memoryDb.products.push(prodRecord);

    memoryDb.product_images.push({
      id: uuidv4(),
      product_id: p.id,
      image_url: p.imageUrl,
      is_primary: true,
      display_order: 1,
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    memoryDb.product_location_snapshots.push({
      id: uuidv4(),
      product_id: p.id,
      taluk_id: 'taluk-devanahalli',
      village_or_town: 'Devanahalli',
      pin_code: '562110',
      latitude: 13.2483,
      longitude: 77.7126,
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    memoryDb.inventory.push({
      id: uuidv4(),
      product_id: p.id,
      quantity: p.quantity,
      total_quantity: p.quantity,
      reserved_quantity: p.reserved,
      last_restocked_at: new Date(),
      created_date: new Date(),
      last_modified_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // 7. Crop Info
  const crops = [
    {
      id: uuidv4(),
      crop_name: 'Paddy (Rice)',
      scientific_name: 'Oryza sativa',
      family: 'Poaceae',
      category: 'Cereal',
      optimal_temperature_min: 20,
      optimal_temperature_max: 35,
      rainfall_min: 1000,
      rainfall_max: 1500,
      soil_type: 'Clayey Loam',
      water_requirement: 'High',
      growth_duration_days: 120,
      life_cycle: 'ANNUAL',
      harvest_season: 'Kharif / Rabi',
      sowing_season: 'June - July',
      diseases: ['Blast', 'Bacterial Leaf Blight', 'Brown Spot'],
      uses: ['Staple food grain', 'Rice bran oil', 'Straw animal fodder'],
    },
    {
      id: uuidv4(),
      crop_name: 'Cotton',
      scientific_name: 'Gossypium hirsutum',
      family: 'Malvaceae',
      category: 'Fiber Crop',
      optimal_temperature_min: 21,
      optimal_temperature_max: 30,
      rainfall_min: 500,
      rainfall_max: 800,
      soil_type: 'Black Cotton Soil',
      water_requirement: 'Medium',
      growth_duration_days: 160,
      life_cycle: 'ANNUAL',
      harvest_season: 'October - January',
      sowing_season: 'May - June',
      diseases: ['Bollworm', 'Fusarium Wilt', 'Leaf Curl Virus'],
      uses: ['Textile yarn', 'Cottonseed oil', 'Animal cake'],
    },
    {
      id: uuidv4(),
      crop_name: 'Ragi (Finger Millet)',
      scientific_name: 'Eleusine coracana',
      family: 'Poaceae',
      category: 'Nutri-Cereal',
      optimal_temperature_min: 15,
      optimal_temperature_max: 30,
      rainfall_min: 400,
      rainfall_max: 750,
      soil_type: 'Red Sandy Loam',
      water_requirement: 'Low (Drought Tolerant)',
      growth_duration_days: 100,
      life_cycle: 'ANNUAL',
      harvest_season: 'September - November',
      sowing_season: 'July - August',
      diseases: ['Ragi Blast', 'Foot Rot'],
      uses: ['Nutritious flour (Mudde)', 'Malted baby food', 'Fodder'],
    },
  ];

  for (const c of crops) {
    const { diseases, uses, ...rest } = c;
    memoryDb.crop_info.push({ ...rest, created_date: new Date(), last_modified_date: new Date() });
    for (const d of diseases) {
      memoryDb.crop_info_common_diseases.push({ crop_info_id: c.id, disease: d });
    }
    for (const u of uses) {
      memoryDb.crop_info_uses.push({ crop_info_id: c.id, use_case: u });
    }
  }

  // 8. Commodities & Market Prices (Pan-India APMC Mandi Integration)
  const todayStr = new Date().toISOString().split('T')[0];

  // Seed Pan-India states, districts, markets, commodities, and mandi prices
  for (const rec of RAW_PAN_INDIA_MANDI_RECORDS) {
    // 1. State
    let s = memoryDb.states.find((x) => x.name.toLowerCase() === rec.state.toLowerCase());
    if (!s) {
      s = {
        id: `state-${rec.state.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: rec.state,
        code: rec.state.slice(0, 2).toUpperCase(),
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.states.push(s);
    }

    // 2. District
    let d = memoryDb.districts.find(
      (x) => x.name.toLowerCase() === rec.district.toLowerCase() && x.state_id === s.id
    );
    if (!d) {
      d = {
        id: `dist-${rec.district.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: rec.district,
        code: rec.district.slice(0, 4).toUpperCase(),
        state_id: s.id,
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.districts.push(d);
    }

    // 3. Market
    let m = memoryDb.markets.find((x) => x.name.toLowerCase() === rec.market.toLowerCase());
    if (!m) {
      m = {
        id: `mkt-${rec.market.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: rec.market,
        district_id: d.id,
        taluk_id: null,
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.markets.push(m);
    } else if (!m.district_id) {
      m.district_id = d.id;
    }

    // 4. Commodity
    let c = memoryDb.commodities.find((x) => x.name.toLowerCase() === rec.commodity.toLowerCase());
    if (!c) {
      c = {
        id: `comm-${rec.commodity.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: rec.commodity,
        code: rec.commodity.slice(0, 3).toUpperCase(),
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.commodities.push(c);
    }

    // 5. Market Price
    memoryDb.market_prices.push({
      id: uuidv4(),
      commodity_id: c.id,
      market_id: m.id,
      min_price: rec.minPrice,
      max_price: rec.maxPrice,
      modal_price: rec.modalPrice,
      variety: rec.variety,
      grade: rec.grade,
      price_date: todayStr,
      created_date: new Date(),
      last_modified_date: new Date(),
    });
  }

  console.log(`[MemoryDb] Master database seeded successfully with ${memoryDb.states.length} states, ${memoryDb.markets.length} APMC markets, and ${memoryDb.market_prices.length} Mandi prices.`);
}
