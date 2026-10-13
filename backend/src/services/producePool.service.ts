import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { ProducePoolDto } from '../types/index.js';

export class ProducePoolService {
  async getConsolidatedPools(filters?: { talukId?: string; districtId?: string; crop?: string }): Promise<ProducePoolDto[]> {
    let rawProducts: any[] = [];

    if (isPostgres()) {
      let query = `
        SELECT p.id, p.name, p.price_per_unit, p.unit, p.status,
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
            farmer_name: u?.full_name || 'Farmer',
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

      // Freight consolidation discount: 45% to 70% savings based on lot size
      const freightSavings = Math.min(75, 45 + Math.round(totalQty / 20));

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
        products: items.map((i) => ({
          id: i.id,
          name: i.name,
          categoryId: 'cat-1',
          sellerId: 'seller',
          farmerName: i.farmer_name,
          pricePerUnit: parseFloat(i.price_per_unit),
          unit: i.unit,
          quantity: parseFloat(i.available_quantity),
          status: 'ACTIVE',
          images: [],
          createdDate: new Date(),
          lastModifiedDate: new Date(),
        })),
        estimatedFreightSavingsPercentage: freightSavings,
      });
    }

    return pools;
  }
}

export const producePoolService = new ProducePoolService();
