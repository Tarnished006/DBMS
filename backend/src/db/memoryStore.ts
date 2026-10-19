import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.js';
import { RAW_PAN_INDIA_MANDI_RECORDS } from '../data/panIndiaMandiData.js';
import { MASTER_AGRICULTURAL_PRODUCTS } from '../data/agriculturalProductsData.js';
import { CROP_ENCYCLOPEDIA_DATA } from '../data/cropEncyclopediaData.js';


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
  notifications: any[];
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
  notifications: [],
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

  // Demo Buyer User (Wholesale / Consumer Buyer)
  const buyerPasswordHash = await bcrypt.hash('Buyer@123', 10);
  const buyerId = '22222222-3333-4444-5555-666666666666';
  const buyerUser = {
    id: buyerId,
    email: 'buyer@agrimarket.com',
    password: buyerPasswordHash,
    full_name: 'Ananya Sharma (Wholesale Buyer)',
    phone_number: '9876501234',
    profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
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
  memoryDb.users.push(buyerUser);
  memoryDb.user_roles.push({ user_id: buyerId, role_id: roleUser.id });

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

  // 6. Products, Inventory & Images - Master Pan-India Agricultural Marketplace Catalog
  for (const raw of MASTER_AGRICULTURAL_PRODUCTS) {
    const category = memoryDb.categories.find(
      c => c.name.toLowerCase() === raw.categoryName.toLowerCase()
    );
    const categoryId = category ? category.id : 'cat-' + raw.categoryKey;

    // Ensure state exists
    let state = memoryDb.states.find(s => s.name.toLowerCase() === raw.state.toLowerCase());
    if (!state) {
      state = {
        id: `state-${raw.state.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: raw.state,
        code: raw.state.substring(0, 2).toUpperCase(),
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.states.push(state);
    }

    // Ensure district exists
    let dist = memoryDb.districts.find(
      d => d.name.toLowerCase() === raw.district.toLowerCase() && d.state_id === state!.id
    );
    if (!dist) {
      dist = {
        id: `dist-${raw.district.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: raw.district,
        code: raw.district.substring(0, 3).toUpperCase(),
        state_id: state.id,
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.districts.push(dist);
    }

    // Ensure taluk exists
    let taluk = memoryDb.taluks.find(
      t => t.name.toLowerCase() === raw.villageOrTown.toLowerCase() && t.district_id === dist!.id
    );
    if (!taluk) {
      taluk = {
        id: `taluk-${raw.villageOrTown.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: raw.villageOrTown,
        district_id: dist.id,
        created_date: new Date(),
        last_modified_date: new Date(),
      };
      memoryDb.taluks.push(taluk);
    }

    const snapshotId = uuidv4();
    memoryDb.product_location_snapshots.push({
      id: snapshotId,
      product_id: raw.id,
      taluk_id: taluk.id,
      village_or_town: raw.villageOrTown,
      district: raw.district,
      state: raw.state,
      pin_code: raw.pinCode,
      latitude: raw.latitude,
      longitude: raw.longitude,
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    const reserved = Math.floor(raw.quantity * 0.05);
    const isHarvestCrop = raw.categoryName === 'Harvested Products' || raw.categoryName === 'Pre-Harvested Products';
    const ownerId = raw.sellerId || (isHarvestCrop ? userId : adminId);
    const ownerName = raw.sellerName || (isHarvestCrop ? normalUser.full_name : adminUser.full_name);

    const prodRecord = {
      id: raw.id,
      category_id: categoryId,
      farmer_id: ownerId,
      seller_id: ownerId,
      seller_name: ownerName,
      farmer_name: ownerName,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      price_per_unit: raw.price,
      unit: raw.unit,
      status: 'ACTIVE',
      badge: raw.badge,
      mandiLinkedCommodity: raw.mandiLinkedCommodity,
      isMandiLinked: Boolean(raw.mandiLinkedCommodity),
      isRentalAvailable: Boolean(raw.isRentalAvailable),
      rentalRate: raw.rentalRate,
      rentalUnit: raw.rentalUnit,
      listingType: raw.listingType || 'BUY',
      product_location_snapshot_id: snapshotId,
      created_date: new Date(),
      last_modified_date: new Date(),
    };
    memoryDb.products.push(prodRecord);

    memoryDb.product_images.push({
      id: uuidv4(),
      product_id: raw.id,
      image_url: raw.imageUrl,
      is_primary: true,
      display_order: 1,
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    memoryDb.inventory.push({
      id: uuidv4(),
      product_id: raw.id,
      quantity: raw.quantity,
      total_quantity: raw.quantity,
      reserved_quantity: reserved,
      last_restocked_at: new Date(),
      created_date: new Date(),
      last_modified_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // 7. Crop Info (Seeded with comprehensive agronomic encyclopedic data)
  for (const c of CROP_ENCYCLOPEDIA_DATA) {
    const { uses, commonDiseases, ...rest } = c;
    memoryDb.crop_info.push({
      ...rest,
      crop_name: c.cropName,
      scientific_name: c.scientificName,
      kannada_name: c.localNames?.kannada,
      hindi_name: c.localNames?.hindi,
      optimal_temperature_min: c.optimalTemperatureMin,
      optimal_temperature_max: c.optimalTemperatureMax,
      rainfall_min: c.rainfallMin,
      rainfall_max: c.rainfallMax,
      soil_type: c.soilType,
      soil_ph: c.soilPh,
      water_requirement: c.waterRequirement,
      growth_duration_days: c.growthDurationDays,
      sowing_season: c.sowingSeason,
      harvest_season: c.harvestSeason,
      growing_duration: `${c.growthDurationDays} Days`,
      temperature_requirements: `${c.optimalTemperatureMin}°C - ${c.optimalTemperatureMax}°C`,
      water_requirements: c.waterRequirement,
      soil_requirements: c.soilType,
      growth_stages: c.growthStages,
      mandi_commodity: c.mandiCommodity,
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    for (const d of commonDiseases || []) {
      memoryDb.crop_info_common_diseases.push({ crop_info_id: c.id, disease: d });
    }
    for (const u of uses || []) {
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

  // 9. Initial Seed Negotiations between Demo Farmer (Ramesh Gowda) and Demo Buyer (Ananya Sharma)
  if (memoryDb.negotiations.length === 0) {
    const neg1Id = 'neg-seed-kolar-tomatoes';
    memoryDb.negotiations.push({
      id: neg1Id,
      produce_id: 'prod-kolar-salad-tomatoes',
      buyer_id: buyerId,
      farmer_id: userId,
      quantity: 500,
      unit: 'KG',
      proposed_price: 28,
      counter_price: 30,
      final_price: null,
      status: 'COUNTERED',
      buyer_notes: 'Urgent bulk procurement for Bangalore retail distribution center. Need prompt dispatch.',
      farmer_notes: 'Grade-A farm sorted lot. Can offer ₹30/KG with same-day APMC vehicle loading.',
      created_date: new Date(Date.now() - 40 * 60 * 1000),
      last_modified_date: new Date(Date.now() - 15 * 60 * 1000),
    });

    const neg2Id = 'neg-seed-red-onions';
    memoryDb.negotiations.push({
      id: neg2Id,
      produce_id: 'prod-nashik-red-onions',
      buyer_id: buyerId,
      farmer_id: userId,
      quantity: 1000,
      unit: 'KG',
      proposed_price: 22,
      counter_price: null,
      final_price: 22,
      status: 'ACCEPTED',
      buyer_notes: 'Procuring 10 quintals for Mysore wholesale depot.',
      farmer_notes: 'Offer accepted. Verified moisture-free farm stock ready for truck pickup.',
      created_date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      last_modified_date: new Date(Date.now() - 50 * 60 * 1000),
    });
  }

  // 10. Initial Seed Order between Demo Buyer (Ananya Sharma) and Demo Farmer (Ramesh Gowda)
  if (memoryDb.orders.length === 0) {
    const orderId = 'order-seed-88301';
    const orderDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
    memoryDb.orders.push({
      id: orderId,
      buyer_id: buyerId,
      status: 'CONFIRMED',
      created_date: orderDate,
      last_modified_date: orderDate,
    });

    memoryDb.order_items.push({
      id: 'order-item-88301-1',
      order_id: orderId,
      product_id: 'prod-nashik-red-onions',
      quantity: 300,
      unit_price: 26,
      created_date: orderDate,
      last_modified_date: orderDate,
    });

    memoryDb.order_address_snapshots.push({
      id: 'addr-snap-88301',
      order_id: orderId,
      address_line1: 'Devanahalli APMC Logistics Bay 1',
      address_line2: 'Airport Corridor Industrial Road',
      landmark: 'Next to Central Cold Storage',
      taluk_id: 'taluk-devanahalli',
      pin_code: '562110',
      latitude: 13.2454,
      longitude: 77.7126,
      created_date: orderDate,
      last_modified_date: orderDate,
    });

    memoryDb.payments.push({
      id: 'pay-seed-88301',
      order_id: orderId,
      amount: 7800,
      currency: 'INR',
      provider: 'MOCK',
      status: 'COMPLETED',
      created_date: orderDate,
      last_modified_date: orderDate,
    });

    memoryDb.deliveries.push({
      id: 'del-seed-88301',
      order_id: orderId,
      status: 'IN_TRANSIT',
      tracking_number: 'TRK-AGR88301',
      carrier_name: 'Certified APMC 3PL Transporter',
      otp_verified: false,
      created_date: orderDate,
      last_modified_date: orderDate,
    });
  }

  // 11. Initial Seed Notifications
  if (memoryDb.notifications.length === 0) {
    const now = Date.now();
    const min = 60 * 1000;
    const hour = 60 * min;

    memoryDb.notifications.push(
      {
        id: uuidv4(),
        userId: userId,
        type: 'NEGOTIATION',
        title: 'Counter-Offer Awaiting Approval 🤝',
        message: 'Ananya Sharma (Wholesale Buyer) offered ₹28/KG on Kolar Salad Tomatoes (500 KG). You countered ₹30/KG.',
        link: '/dashboard/negotiations?tab=farmer&id=neg-seed-kolar-tomatoes',
        isRead: false,
        metadata: { negotiationId: 'neg-seed-kolar-tomatoes', produceName: 'Kolar Salad Tomatoes', counterPrice: 30 },
        createdDate: new Date(now - 15 * min),
      },
      {
        id: uuidv4(),
        userId: userId,
        type: 'NEGOTIATION',
        title: 'Wholesale Offer Accepted! 🤝',
        message: 'You accepted Ananya Sharma’s offer of ₹22/KG on 1,000 KG Nashik Red Onions! Ready for dispatch.',
        link: '/dashboard/negotiations?tab=farmer&id=neg-seed-red-onions',
        isRead: false,
        metadata: { negotiationId: 'neg-seed-red-onions', produceName: 'Nashik Red Onions', agreedPrice: 22 },
        createdDate: new Date(now - 50 * min),
      },
      {
        id: uuidv4(),
        userId: userId,
        type: 'ORDER',
        title: 'Wholesale Order Placed 📦',
        message: 'Order #AGR-88301 placed for 300 KG Nashik Red Onions. Awaiting your dispatch confirmation.',
        link: '/orders',
        isRead: false,
        metadata: { orderId: 'order-seed-88301', orderNumber: 'AGR-88301' },
        createdDate: new Date(now - 3 * hour),
      },
      {
        id: uuidv4(),
        userId: userId,
        type: 'PRICE_ALERT',
        title: 'Mandi Price Movement 📈',
        message: 'Kolar APMC Mandi Tomato rates surged +12% today (₹34.50/KG). Optimal time to sell.',
        link: '/market-prices',
        isRead: true,
        metadata: { mandi: 'Kolar Mandi', commodity: 'Tomato' },
        createdDate: new Date(now - 5 * hour),
      },
      {
        id: uuidv4(),
        userId: buyerId,
        type: 'NEGOTIATION',
        title: 'Farmer Counter-Offer Received 🤝',
        message: 'Farmer Ramesh Gowda counter-offered ₹30/KG for 500 KG Kolar Salad Tomatoes. 1-Click Accept ready.',
        link: '/dashboard/negotiations?tab=buyer&id=neg-seed-kolar-tomatoes',
        isRead: false,
        metadata: { negotiationId: 'neg-seed-kolar-tomatoes', produceName: 'Kolar Salad Tomatoes', counterPrice: 30 },
        createdDate: new Date(now - 15 * min),
      },
      {
        id: uuidv4(),
        userId: buyerId,
        type: 'NEGOTIATION',
        title: 'Bargain Finalized & Accepted! 🤝',
        message: 'Farmer Ramesh Gowda accepted your offer of ₹22/KG on 1,000 KG Nashik Red Onions! 1-Click Checkout ready.',
        link: '/dashboard/negotiations?tab=buyer&id=neg-seed-red-onions',
        isRead: false,
        metadata: { negotiationId: 'neg-seed-red-onions', produceName: 'Nashik Red Onions', agreedPrice: 22 },
        createdDate: new Date(now - 50 * min),
      },
      {
        id: uuidv4(),
        userId: buyerId,
        type: 'ORDER',
        title: 'Order Status Update 🚚',
        message: 'Order #AGR-88301 confirmed by grower. Certified APMC 3PL Transporter dispatched from Devanahalli.',
        link: '/orders',
        isRead: false,
        metadata: { orderId: 'order-seed-88301', orderNumber: 'AGR-88301' },
        createdDate: new Date(now - 3 * hour),
      },
      {
        id: uuidv4(),
        userId: buyerId,
        type: 'PRICE_ALERT',
        title: 'Mandi Supply Inflow 🌾',
        message: 'Fresh Grade-A Shimla Capsicum arrivals reached Bangalore Binny Mill APMC at ₹42.00/KG.',
        link: '/market-prices',
        isRead: true,
        metadata: { mandi: 'Binny Mill APMC', commodity: 'Capsicum' },
        createdDate: new Date(now - 5 * hour),
      }
    );
  }

  // Restore dynamic user data, products, and sessions from disk snapshot if available
  restoreMemoryDbSnapshot();

  console.log(`[MemoryDb] Master database seeded successfully with ${memoryDb.states.length} states, ${memoryDb.markets.length} APMC markets, and ${memoryDb.market_prices.length} Mandi prices.`);
}

const SNAPSHOT_FILE = path.resolve(process.cwd(), '.memory_db_snapshot.json');

export function saveMemoryDbSnapshot(): void {
  try {
    const dataToSave = {
      users: memoryDb.users,
      user_roles: memoryDb.user_roles,
      products: memoryDb.products,
      product_location_snapshots: memoryDb.product_location_snapshots,
      inventory: memoryDb.inventory,
      orders: memoryDb.orders,
      order_items: memoryDb.order_items,
      order_address_snapshots: memoryDb.order_address_snapshots,
      negotiations: memoryDb.negotiations,
      buyer_demands: memoryDb.buyer_demands,
      demand_bids: memoryDb.demand_bids,
      notifications: memoryDb.notifications,
      refresh_token_sessions: memoryDb.refresh_token_sessions,
    };
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal, silent fallback
  }
}

export function restoreMemoryDbSnapshot(): boolean {
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (Array.isArray(parsed.users)) {
          for (const u of parsed.users) {
            if (!memoryDb.users.some((existing) => existing.email.toLowerCase() === u.email.toLowerCase())) {
              memoryDb.users.push(u);
            }
          }
        }
        if (Array.isArray(parsed.user_roles)) {
          for (const ur of parsed.user_roles) {
            if (!memoryDb.user_roles.some((existing) => existing.user_id === ur.user_id && existing.role_id === ur.role_id)) {
              memoryDb.user_roles.push(ur);
            }
          }
        }
        if (Array.isArray(parsed.products)) {
          for (const p of parsed.products) {
            if (
              (p.seller_id === '38b5459e-f2de-4f86-be60-f0bd926020ec' || p.farmer_id === '38b5459e-f2de-4f86-be60-f0bd926020ec') &&
              (p.category_id === 'cat-harvested' || p.category_id === 'cat-pre-harvested' || p.id?.includes('salad') || p.id?.includes('onion') || p.id?.includes('mango') || p.id?.includes('tomato'))
            ) {
              p.seller_id = '11111111-2222-3333-4444-555555555555';
              p.farmer_id = '11111111-2222-3333-4444-555555555555';
            }
            if (!memoryDb.products.some((existing) => existing.id === p.id)) {
              memoryDb.products.unshift(p);
            }
          }
        }
        if (Array.isArray(parsed.product_location_snapshots)) {
          for (const snap of parsed.product_location_snapshots) {
            if (!memoryDb.product_location_snapshots.some((existing) => existing.id === snap.id)) {
              memoryDb.product_location_snapshots.push(snap);
            }
          }
        }
        if (Array.isArray(parsed.inventory)) {
          for (const inv of parsed.inventory) {
            if (!memoryDb.inventory.some((existing) => existing.id === inv.id)) {
              memoryDb.inventory.push(inv);
            }
          }
        }
        if (Array.isArray(parsed.orders)) {
          for (const o of parsed.orders) {
            if (!memoryDb.orders.some((existing) => existing.id === o.id)) {
              memoryDb.orders.push(o);
            }
          }
        }
        if (Array.isArray(parsed.negotiations)) {
          for (const n of parsed.negotiations) {
            if (!memoryDb.negotiations.some((existing) => existing.id === n.id)) {
              memoryDb.negotiations.push(n);
            }
          }
        }
        if (Array.isArray(parsed.buyer_demands)) {
          for (const d of parsed.buyer_demands) {
            if (!memoryDb.buyer_demands.some((existing) => existing.id === d.id)) {
              memoryDb.buyer_demands.push(d);
            }
          }
        }
        if (Array.isArray(parsed.demand_bids)) {
          for (const b of parsed.demand_bids) {
            if (!memoryDb.demand_bids.some((existing) => existing.id === b.id)) {
              memoryDb.demand_bids.push(b);
            }
          }
        }
        if (Array.isArray(parsed.notifications)) {
          for (const notif of parsed.notifications) {
            if (!memoryDb.notifications.some((existing) => existing.id === notif.id)) {
              memoryDb.notifications.push(notif);
            }
          }
        }
        return true;
      }
    }
  } catch (err) {
    // Non-fatal
  }
  return false;
}

