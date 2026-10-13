import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { ProductDto } from '../types/index.js';

export class ProductService {
  async createProduct(sellerId: string, data: any): Promise<ProductDto> {
    const productId = uuidv4();
    const now = new Date();

    if (isPostgres()) {
      await db.query(
        `INSERT INTO products (
          id, category_id, seller_id, name, description, price_per_unit, unit, status, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', $8, $8)`,
        [
          productId,
          data.categoryId,
          sellerId,
          data.name.trim(),
          data.description?.trim() || null,
          data.pricePerUnit,
          data.unit.trim(),
          now,
        ]
      );

      // Create Location snapshot
      await db.query(
        `INSERT INTO product_location_snapshots (
          id, product_id, taluk_id, village_or_town, pin_code, latitude, longitude, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [
          uuidv4(),
          productId,
          data.talukId,
          data.villageOrTown?.trim() || null,
          data.pinCode?.trim() || null,
          data.latitude || null,
          data.longitude || null,
          now,
        ]
      );

      // Create Inventory
      await db.query(
        `INSERT INTO inventory (
          id, product_id, quantity, reserved_quantity, last_restocked_at, created_date, last_modified_date
        ) VALUES ($1, $2, $3, 0, $4, $4, $4)`,
        [uuidv4(), productId, data.quantity || 0, now]
      );
    } else {
      const prod = {
        id: productId,
        category_id: data.categoryId,
        seller_id: sellerId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price_per_unit: data.pricePerUnit,
        unit: data.unit.trim(),
        status: 'ACTIVE',
        created_date: now,
        last_modified_date: now,
      };
      memoryDb.products.push(prod);

      memoryDb.product_location_snapshots.push({
        id: uuidv4(),
        product_id: productId,
        taluk_id: data.talukId,
        village_or_town: data.villageOrTown?.trim() || null,
        pin_code: data.pinCode?.trim() || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        created_date: now,
        last_modified_date: now,
      });

      memoryDb.inventory.push({
        id: uuidv4(),
        product_id: productId,
        quantity: data.quantity || 0,
        reserved_quantity: 0,
        last_restocked_at: now,
        created_date: now,
        last_modified_date: now,
      });
    }

    return this.getProductById(productId);
  }

  async getProductById(productId: string): Promise<ProductDto> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT p.*, c.name as category_name, u.full_name as seller_name
         FROM products p
         JOIN categories c ON c.id = p.category_id
         JOIN users u ON u.id = p.seller_id
         WHERE p.id = $1`,
        [productId]
      );
      if (res.rows.length === 0) throw new BusinessException('PRODUCT_NOT_FOUND');
      return this.enrichDbProduct(res.rows[0]);
    }

    const prod = memoryDb.products.find((p) => p.id === productId);
    if (!prod) throw new BusinessException('PRODUCT_NOT_FOUND');
    return this.enrichMemoryProduct(prod);
  }

  async getAllProducts(filters: any = {}): Promise<{
    content: ProductDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const page = Math.max(0, parseInt(filters.page || '0', 10));
    const size = Math.max(1, Math.min(100, parseInt(filters.size || '10', 10)));
    const search = (filters.search || filters.q || '').toLowerCase().trim();
    const categoryId = filters.categoryId;
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
    const status = filters.status || 'ACTIVE';

    if (isPostgres()) {
      const conditions: string[] = [];
      const params: any[] = [];
      let pIdx = 1;

      if (status !== 'ALL') {
        conditions.push(`p.status = $${pIdx++}`);
        params.push(status);
      }

      if (categoryId) {
        conditions.push(`p.category_id = $${pIdx++}`);
        params.push(categoryId);
      }

      if (search) {
        conditions.push(`(LOWER(p.name) LIKE $${pIdx} OR LOWER(p.description) LIKE $${pIdx})`);
        params.push(`%${search}%`);
        pIdx++;
      }

      if (minPrice !== null) {
        conditions.push(`p.price_per_unit >= $${pIdx++}`);
        params.push(minPrice);
      }

      if (maxPrice !== null) {
        conditions.push(`p.price_per_unit <= $${pIdx++}`);
        params.push(maxPrice);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countRes = await db.query(
        `SELECT COUNT(*) FROM products p ${whereClause}`,
        params
      );
      const totalElements = parseInt(countRes.rows[0].count, 10);

      const offset = page * size;
      const listRes = await db.query(
        `SELECT p.*, c.name as category_name, u.full_name as seller_name
         FROM products p
         JOIN categories c ON c.id = p.category_id
         JOIN users u ON u.id = p.seller_id
         ${whereClause}
         ORDER BY p.created_date DESC
         LIMIT $${pIdx++} OFFSET $${pIdx++}`,
        [...params, size, offset]
      );

      const content = await Promise.all(listRes.rows.map((r: any) => this.enrichDbProduct(r)));

      return {
        content,
        totalElements,
        totalPages: Math.ceil(totalElements / size),
        size,
        number: page,
      };
    }

    // Memory Store filtering
    let list = memoryDb.products.filter((p) => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (categoryId && p.category_id !== categoryId) return false;
      if (minPrice !== null && p.price_per_unit < minPrice) return false;
      if (maxPrice !== null && p.price_per_unit > maxPrice) return false;
      if (search) {
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesDesc = p.description?.toLowerCase().includes(search);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });

    const totalElements = list.length;
    const offset = page * size;
    const sliced = list.slice(offset, offset + size);
    const content = sliced.map((p) => this.enrichMemoryProduct(p));

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      size,
      number: page,
    };
  }

  async getMyProducts(sellerId: string, filters: any = {}) {
    return this.getAllProducts({ ...filters, sellerId, status: filters.status || 'ALL' });
  }

  async updateProduct(sellerId: string, productId: string, data: any, isAdmin = false): Promise<ProductDto> {
    const existing = await this.getProductById(productId);
    if (!isAdmin && existing.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED', 'You do not have permission to modify this product.');
    }

    if (isPostgres()) {
      await db.query(
        `UPDATE products SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price_per_unit = COALESCE($3, price_per_unit),
          unit = COALESCE($4, unit),
          status = COALESCE($5, status),
          last_modified_date = $6
        WHERE id = $7`,
        [
          data.name?.trim() || null,
          data.description !== undefined ? data.description : null,
          data.pricePerUnit || null,
          data.unit?.trim() || null,
          data.status || null,
          new Date(),
          productId,
        ]
      );
      return this.getProductById(productId);
    }

    const prod = memoryDb.products.find((p) => p.id === productId);
    if (!prod) throw new BusinessException('PRODUCT_NOT_FOUND');

    if (data.name) prod.name = data.name.trim();
    if (data.description !== undefined) prod.description = data.description;
    if (data.pricePerUnit) prod.price_per_unit = data.pricePerUnit;
    if (data.unit) prod.unit = data.unit.trim();
    if (data.status) prod.status = data.status;
    prod.last_modified_date = new Date();

    return this.enrichMemoryProduct(prod);
  }

  async deleteProduct(sellerId: string, productId: string, isAdmin = false): Promise<void> {
    const existing = await this.getProductById(productId);
    if (!isAdmin && existing.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED');
    }

    // Check if product is in any orders
    if (isPostgres()) {
      const orderRes = await db.query('SELECT id FROM order_items WHERE product_id = $1 LIMIT 1', [productId]);
      if (orderRes.rows.length > 0) {
        throw new BusinessException('DATA_INTEGRITY_VIOLATION', 'Cannot delete: Linked to existing orders. Deactivate instead.');
      }
      await db.query('DELETE FROM products WHERE id = $1', [productId]);
    } else {
      const inOrder = memoryDb.order_items.some((oi) => oi.product_id === productId);
      if (inOrder) {
        throw new BusinessException('DATA_INTEGRITY_VIOLATION', 'Cannot delete: Linked to existing orders. Deactivate instead.');
      }
      memoryDb.products = memoryDb.products.filter((p) => p.id !== productId);
    }
  }

  async getProductLocation(productId: string) {
    const prod = await this.getProductById(productId);
    return prod.location;
  }

  private async enrichDbProduct(row: any): Promise<ProductDto> {
    // Images
    const imgRes = await db.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
      [row.id]
    );
    const images = imgRes.rows.map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      imageUrl: i.image_url,
      isPrimary: !!i.is_primary,
      displayOrder: i.display_order,
    }));

    // Inventory
    const invRes = await db.query('SELECT * FROM inventory WHERE product_id = $1', [row.id]);
    const inv = invRes.rows[0];
    const inventory = inv
      ? {
          id: inv.id,
          productId: inv.product_id,
          quantity: inv.quantity,
          reservedQuantity: inv.reserved_quantity,
          availableQuantity: Math.max(0, inv.quantity - inv.reserved_quantity),
          lastRestockedAt: inv.last_restocked_at,
        }
      : undefined;

    // Location
    const locRes = await db.query(
      `SELECT pls.*, t.name as taluk_name, d.name as district_name, s.name as state_name
       FROM product_location_snapshots pls
       JOIN taluks t ON t.id = pls.taluk_id
       JOIN districts d ON d.id = t.district_id
       JOIN states s ON s.id = d.state_id
       WHERE pls.product_id = $1`,
      [row.id]
    );
    const loc = locRes.rows[0];
    const location = loc
      ? {
          id: loc.id,
          productId: loc.product_id,
          talukId: loc.taluk_id,
          taluk: loc.taluk_name,
          district: loc.district_name,
          state: loc.state_name,
          villageOrTown: loc.village_or_town,
          pinCode: loc.pin_code,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
        }
      : undefined;

    return {
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      sellerId: row.seller_id,
      sellerName: row.seller_name,
      name: row.name,
      description: row.description,
      pricePerUnit: parseFloat(row.price_per_unit),
      unit: row.unit,
      status: row.status,
      images,
      inventory,
      location,
      createdDate: row.created_date,
      lastModifiedDate: row.last_modified_date,
    };
  }

  private enrichMemoryProduct(prod: any): ProductDto {
    const images = memoryDb.product_images
      .filter((i) => i.product_id === prod.id)
      .map((i) => ({
        id: i.id,
        productId: i.product_id,
        imageUrl: i.image_url,
        isPrimary: !!i.is_primary,
        displayOrder: i.display_order,
      }));

    const inv = memoryDb.inventory.find((i) => i.product_id === prod.id);
    const inventory = inv
      ? {
          id: inv.id,
          productId: inv.product_id,
          quantity: inv.quantity,
          reservedQuantity: inv.reserved_quantity,
          availableQuantity: Math.max(0, inv.quantity - inv.reserved_quantity),
          lastRestockedAt: inv.last_restocked_at,
        }
      : undefined;

    const loc = memoryDb.product_location_snapshots.find((l) => l.product_id === prod.id);
    let location = undefined;
    if (loc) {
      const taluk = memoryDb.taluks.find((t) => t.id === loc.taluk_id);
      const dist = taluk ? memoryDb.districts.find((d) => d.id === taluk.district_id) : null;
      const state = dist ? memoryDb.states.find((s) => s.id === dist.state_id) : null;
      location = {
        id: loc.id,
        productId: loc.product_id,
        talukId: loc.taluk_id,
        taluk: taluk?.name,
        district: dist?.name,
        state: state?.name,
        villageOrTown: loc.village_or_town,
        pinCode: loc.pin_code,
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
    }

    const cat = memoryDb.categories.find((c) => c.id === prod.category_id);
    const seller = memoryDb.users.find((u) => u.id === prod.seller_id);

    return {
      id: prod.id,
      categoryId: prod.category_id,
      categoryName: cat?.name,
      sellerId: prod.seller_id,
      sellerName: seller?.full_name,
      name: prod.name,
      description: prod.description,
      pricePerUnit: prod.price_per_unit,
      unit: prod.unit,
      status: prod.status,
      images,
      inventory,
      location,
      createdDate: prod.created_date,
      lastModifiedDate: prod.last_modified_date,
    };
  }
}

export const productService = new ProductService();
