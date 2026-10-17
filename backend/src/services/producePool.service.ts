import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { ProducePoolDto } from '../types/index.js';

export class ProducePoolService {
  async getConsolidatedPools(filters?: { talukId?: string; districtId?: string; crop?: string }): Promise<ProducePoolDto[]> {
    let rawProducts: any[] = [];

    if (isPostgres()) {
      let query = `
        SELECT p.id, p.name, p.price_per_unit, p.unit, p.status, p.badge,
               u.full_name as farmer_name,
               pls.taluk_id, pls.village_or_town,
               t.name as taluk_name, d.name as district_name,
               COALESCE(i.available_quantity, 0) as available_quantity
        FROM products p
        JOIN users u ON u.id = p.seller_id
        LEFT JOIN product_location_snapshots pls ON pls.product_id = p.id
        LEFT JOIN taluks t ON t.id = pls.taluk_id
        LEFT JOIN districts d ON d.id = t.district_id
        LEFT JOIN inventory i ON i.product_id = p.id
        WHERE p.status = 'ACTIVE' AND COALESCE(i.available_quantity, 0) > 0
      `;
      const params: any[] = [];
      let idx = 1;

      if (filters?.talukId) {
        query += ` AND pls.taluk_id = $${idx++}`;
        params.push(filters.talukId);
      }
      if (filters?.districtId) {
        query += ` AND t.district_id = $${idx++}`;
        params.push(filters.districtId);
      }
      if (filters?.crop) {
        query += ` AND LOWER(p.name) LIKE $${idx++}`;
        params.push(`%${filters.crop.toLowerCase().trim()}%`);
      }

      query += ' ORDER BY t.name ASC, p.name ASC';
      const res = await db.query(query, params);
      rawProducts = res.rows;
    } else {
      rawProducts = memoryDb.products
        .filter((p) => p.status === 'ACTIVE')
        .map((p) => {
          const loc = memoryDb.product_location_snapshots.find((l) => l.product_id === p.id);
          const taluk = loc ? memoryDb.taluks.find((t) => t.id === loc.taluk_id) : null;
          const dist = taluk ? memoryDb.districts.find((d) => d.id === taluk.district_id) : null;
          const inv = memoryDb.inventory.find((i) => i.product_id === p.id);
          const u = memoryDb.users.find((user) => user.id === p.seller_id);
          return {
            id: p.id,
            name: p.name,
            price_per_unit: p.price_per_unit,
            unit: p.unit || 'KG',
            status: p.status,
            badge: p.badge || 'Grade A',
            farmer_name: u?.full_name || p.farmer_name || 'Farmer',
            village_or_town: loc?.village_or_town || 'Village Center',
            taluk_id: loc?.taluk_id,
            taluk_name: taluk?.name || 'Local Taluk',
            district_name: dist?.name || 'Local District',
            available_quantity: inv?.available_quantity || 100,
          };
        });

      if (filters?.talukId) {
        rawProducts = rawProducts.filter((p) => p.taluk_id === filters.talukId);
      }
      if (filters?.crop) {
        rawProducts = rawProducts.filter((p) =>
          p.name.toLowerCase().includes(filters.crop!.toLowerCase().trim())
        );
      }
    }

    // Group products by Taluk + Crop Name (e.g. "Devanahalli - Tomatoes")
    const poolMap = new Map<string, any[]>();
    for (const prod of rawProducts) {
      const key = `${prod.taluk_name || 'Central'}-${prod.name.toLowerCase().trim()}`;
      if (!poolMap.has(key)) {
        poolMap.set(key, []);
      }
      poolMap.get(key)!.push(prod);
    }

    const pools: ProducePoolDto[] = [];
    for (const [key, items] of poolMap.entries()) {
      const first = items[0];
      const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.available_quantity) || 0), 0);
      const avgPrice =
        items.reduce((sum, item) => sum + (parseFloat(item.price_per_unit) || 0), 0) / items.length;
      const uniqueFarmers = new Set(items.map((i) => i.farmer_name)).size;

      // Realistic freight consolidation calculations
      const freightSavings = Math.min(75, 45 + Math.round(totalQty / 20));
      const targetCapacity = totalQty <= 2500 ? 3500 : totalQty <= 5000 ? 5000 : 10000;
      const vehicleType = targetCapacity <= 3500 ? 'Tata Ace Mega (3.5 MT)' : targetCapacity <= 5000 ? 'Tata 407 LPT (5 MT)' : 'Eicher Pro 2049 (10 MT)';
      const departureTime = 'Tomorrow at 06:30 AM (Weighment closes 05:45 AM)';
      const pickupHub = `${first.taluk_name || 'Taluk'} APMC Yard Logistics Bay 3`;
      const destinationMandi = 'Yeshwanthpur Wholesale Terminal, Bengaluru';

      pools.push({
        id: `pool-${key.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}`,
        cropName: first.name,
        talukId: first.taluk_id,
        talukName: first.taluk_name || 'Consolidated Region',
        districtName: first.district_name || 'Karnataka',
        totalQuantity: Math.round(totalQty),
        unit: first.unit || 'KG',
        avgPricePerUnit: Math.round(avgPrice * 10) / 10,
        participatingFarmersCount: uniqueFarmers,
        targetCapacity,
        vehicleType,
        pickupHub,
        departureTime,
        destinationMandi,
        estimatedFreightSavingsPercentage: freightSavings,
        products: items.map((i) => ({
          id: i.id,
          name: i.name,
          categoryId: 'cat-harvested',
          sellerId: 'seller',
          farmerName: i.farmer_name,
          villageOrTown: i.village_or_town || `${first.taluk_name} Hub`,
          qualityGrade: i.badge || 'Grade A (Farm Fresh)',
          pricePerUnit: parseFloat(i.price_per_unit),
          unit: i.unit,
          quantity: parseFloat(i.available_quantity),
          status: 'ACTIVE',
          images: [],
          createdDate: new Date(),
          lastModifiedDate: new Date(),
        })),
      });
    }

    return pools;
  }

  /**
   * Farmer pledges a new harvest lot directly into the village truck pool
   */
  async pledgeToPool(data: {
    poolId: string;
    farmerName?: string;
    farmerId?: string;
    quantity: number;
    pricePerUnit?: number;
    villageOrTown?: string;
  }): Promise<{ success: boolean; message: string; pool: ProducePoolDto; slip: any }> {
    const pools = await this.getConsolidatedPools();
    const existing = pools.find((p) => p.id === data.poolId);
    if (!existing) {
      throw new BusinessException('RESOURCE_NOT_FOUND', 'Produce pool not found');
    }

    const newProdId = `prod-pooled-${Date.now()}`;
    const qty = Number(data.quantity) || 100;
    const price = Number(data.pricePerUnit) || existing.avgPricePerUnit;
    const farmer = data.farmerName?.trim() || 'Verified Local Farmer';
    const village = data.villageOrTown?.trim() || `${existing.talukName} Village`;

    // Add to in-memory store
    const newProduct = {
      id: newProdId,
      category_id: 'cat-harvested',
      farmer_id: data.farmerId || 'demo-farmer-id',
      seller_id: data.farmerId || 'demo-farmer-id',
      farmer_name: farmer,
      seller_name: farmer,
      name: existing.cropName,
      description: `Pooled village harvest lot from ${village}, ${existing.talukName}.`,
      price,
      price_per_unit: price,
      unit: existing.unit,
      status: 'ACTIVE',
      badge: 'Grade A (Pooled Harvest)',
      created_date: new Date(),
      last_modified_date: new Date(),
    };
    memoryDb.products.unshift(newProduct);

    // Snapshot
    const snapId = `snap-${Date.now()}`;
    memoryDb.product_location_snapshots.push({
      id: snapId,
      product_id: newProdId,
      taluk_id: existing.talukId || 'taluk-devanahalli',
      village_or_town: village,
      district: existing.districtName || 'Bengaluru Rural',
      state: 'Karnataka',
      pin_code: '562110',
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    // Inventory
    memoryDb.inventory.push({
      id: `inv-${Date.now()}`,
      product_id: newProdId,
      total_quantity: qty,
      available_quantity: qty,
      reserved_quantity: 0,
      unit: existing.unit,
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    // Also insert into Postgres if postgres is connected
    if (isPostgres()) {
      try {
        await db.query(
          `INSERT INTO products (id, category_id, seller_id, name, description, price_per_unit, unit, status, created_date, last_modified_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', NOW(), NOW())`,
          [newProdId, 'cat-1', data.farmerId || '11111111-2222-3333-4444-555555555555', existing.cropName, newProduct.description, price, existing.unit]
        );
        await db.query(
          `INSERT INTO inventory (id, product_id, total_quantity, available_quantity, reserved_quantity, created_date, last_modified_date)
           VALUES ($1, $2, $3, $4, 0, NOW(), NOW())`,
          [`inv-${Date.now()}`, newProdId, qty, qty]
        );
      } catch {}
    }

    // Re-fetch updated pools
    const updatedPools = await this.getConsolidatedPools();
    const updated = updatedPools.find((p) => p.id === data.poolId) || existing;

    const slip = {
      slipNumber: `SLIP-PL-${Math.floor(100000 + Math.random() * 900000)}`,
      farmerName: farmer,
      village,
      cropName: existing.cropName,
      quantityPledged: `${qty} ${existing.unit}`,
      unitPrice: `₹${price}/${existing.unit}`,
      pickupBay: `${existing.talukName} APMC Logistics Bay 3`,
      departureSchedule: 'Tomorrow at 06:30 AM',
      freightSavings: `${existing.estimatedFreightSavingsPercentage}% Saved`,
    };

    return {
      success: true,
      message: `Successfully pledged ${qty} ${existing.unit} to the ${existing.cropName} truck pool!`,
      pool: updated,
      slip,
    };
  }

  /**
   * Farmer initiates / requests a new dedicated community truck pool route
   */
  async requestRoute(data: {
    cropName: string;
    talukName?: string;
    districtName?: string;
    villageOrTown?: string;
    farmerName?: string;
    farmerId?: string;
    initialQuantity: number;
    pricePerUnit?: number;
    targetVehicle?: string;
    departureDate?: string;
    destinationMandi?: string;
  }): Promise<{ success: boolean; message: string; pool: ProducePoolDto; slip: any }> {
    const crop = data.cropName?.trim() || 'Tomatoes';
    const talukName = data.talukName?.trim() || 'Devanahalli';
    const districtName = data.districtName?.trim() || 'Bengaluru Rural';
    const village = data.villageOrTown?.trim() || `${talukName} Village Hub`;
    const farmer = data.farmerName?.trim() || 'Initiating Farmer';
    const qty = Number(data.initialQuantity) || 500;
    const price = Number(data.pricePerUnit) || 30;
    const destination = data.destinationMandi?.trim() || 'Yeshwanthpur Wholesale Terminal, Bengaluru';
    const departure = data.departureDate?.trim() || 'Tomorrow at 06:30 AM (Weighment closes 05:45 AM)';

    const newProdId = `prod-route-${Date.now()}`;

    // Lookup taluk in memoryDb
    const talukMatch = memoryDb.taluks.find(
      (t) => t.name.toLowerCase() === talukName.toLowerCase()
    );
    const talukId = talukMatch ? talukMatch.id : 'taluk-devanahalli';

    // Insert new product
    const newProduct = {
      id: newProdId,
      category_id: 'cat-harvested',
      farmer_id: data.farmerId || 'demo-farmer-id',
      seller_id: data.farmerId || 'demo-farmer-id',
      farmer_name: farmer,
      seller_name: farmer,
      name: crop,
      description: `Initiating batch for pooled community truck from ${village}, ${talukName}.`,
      price,
      price_per_unit: price,
      unit: 'KG',
      status: 'ACTIVE',
      badge: 'Grade A (Route Originator)',
      created_date: new Date(),
      last_modified_date: new Date(),
    };
    memoryDb.products.unshift(newProduct);

    // Location snapshot
    const snapId = `snap-route-${Date.now()}`;
    memoryDb.product_location_snapshots.push({
      id: snapId,
      product_id: newProdId,
      taluk_id: talukId,
      village_or_town: village,
      district: districtName,
      state: 'Karnataka',
      pin_code: '562110',
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    // Inventory
    memoryDb.inventory.push({
      id: `inv-route-${Date.now()}`,
      product_id: newProdId,
      total_quantity: qty,
      available_quantity: qty,
      reserved_quantity: 0,
      unit: 'KG',
      created_date: new Date(),
      last_modified_date: new Date(),
    });

    // If Postgres is connected
    if (isPostgres()) {
      try {
        await db.query(
          `INSERT INTO products (id, category_id, seller_id, name, description, price_per_unit, unit, status, created_date, last_modified_date)
           VALUES ($1, $2, $3, $4, $5, $6, 'KG', 'ACTIVE', NOW(), NOW())`,
          [newProdId, 'cat-1', data.farmerId || '11111111-2222-3333-4444-555555555555', crop, newProduct.description, price]
        );
        await db.query(
          `INSERT INTO inventory (id, product_id, total_quantity, available_quantity, reserved_quantity, created_date, last_modified_date)
           VALUES ($1, $2, $3, $4, 0, NOW(), NOW())`,
          [`inv-route-${Date.now()}`, newProdId, qty, qty]
        );
      } catch {}
    }

    const updatedPools = await this.getConsolidatedPools();
    const pool =
      updatedPools.find(
        (p) =>
          p.cropName.toLowerCase() === crop.toLowerCase() &&
          p.talukName?.toLowerCase() === talukName.toLowerCase()
      ) || updatedPools[0];

    const vehicle =
      data.targetVehicle ||
      (qty <= 2500 ? 'Tata Ace Mega (3.5 MT)' : qty <= 5000 ? 'Tata 407 LPT (5 MT)' : 'Eicher Pro 2049 (10 MT)');

    const slip = {
      slipNumber: `TRK-REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      bookingType: 'New Dedicated Community Truck Route',
      farmerName: farmer,
      village,
      taluk: talukName,
      cropName: crop,
      initialQuantity: `${qty} KG`,
      targetCapacity: `${pool?.targetCapacity || 3500} KG`,
      vehicleAssigned: vehicle,
      pickupBay: `${talukName} APMC Logistics Bay 1`,
      departureSchedule: departure,
      destinationMandi: destination,
      freightSavings: 'Up to 75% Community Freight Discount',
    };

    return {
      success: true,
      message: `New truck pool route initiated for ${crop} in ${talukName}! Other farmers can now join.`,
      pool,
      slip,
    };
  }
}

export const producePoolService = new ProducePoolService();


