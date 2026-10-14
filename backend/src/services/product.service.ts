import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { ProductDto } from '../types/index.js';

export class ProductService {
  async createProduct(sellerId: string, data: any): Promise<ProductDto> {
    const productId = uuidv4();
    const snapshotId = uuidv4();
    const now = new Date();
    const price = data.pricePerUnit ?? data.price;
    const qty = data.quantity || 0;

    if (isPostgres()) {
      // 1. Create Location Snapshot first (products foreign key constraint requires it)
      await db.query(
        `INSERT INTO product_location_snapshots (
          id, taluk_id, address_line1, village, city, pincode, country, latitude, longitude, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, 'India', $7, $8, $9, $9)`,
        [
          snapshotId,
          data.talukId || null,
          data.addressLine1?.trim() || data.villageOrTown?.trim() || 'Direct Farm',
          data.villageOrTown?.trim() || null,
          data.city?.trim() || data.villageOrTown?.trim() || 'Farm',
          data.pinCode?.trim() || '580001',
          data.latitude || null,
          data.longitude || null,
          now,
        ]
      );

      // 2. Create Product with normalized columns (farmer_id, price, product_location_snapshot_id)
      await db.query(
        `INSERT INTO products (
          id, category_id, farmer_id, name, description, price, unit, status, product_location_snapshot_id, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', $8, $9, $9)`,
        [
          productId,
          data.categoryId,
          sellerId,
          data.name.trim(),
          data.description?.trim() || null,
          price,
          data.unit.trim(),
          snapshotId,
          now,
        ]
      );

      // 3. Create Inventory record
      await db.query(
        `INSERT INTO inventory (
          id, product_id, total_quantity, reserved_quantity, created_at, updated_at
        ) VALUES ($1, $2, $3, 0, $4, $4)`,
        [uuidv4(), productId, qty, now]
      );
    } else {
      const prod = {
        id: productId,
        category_id: data.categoryId,
        farmer_id: sellerId,
        seller_id: sellerId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: price,
        price_per_unit: price,
        unit: data.unit.trim(),
        status: 'ACTIVE',
        product_location_snapshot_id: snapshotId,
        created_date: now,
        last_modified_date: now,
      };
      memoryDb.products.push(prod);

      memoryDb.product_location_snapshots.push({
        id: snapshotId,
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
        quantity: qty,
        total_quantity: qty,
        reserved_quantity: 0,
        last_restocked_at: now,
        created_at: now,
        updated_at: now,
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
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN users u ON u.id = p.farmer_id
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
    const sellerId = filters.sellerId || filters.farmerId;
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
    const status = filters.status || 'ACTIVE';

    const sortField = (filters.sortBy || filters.sort || 'created_date').toString();
    const sortDir = (filters.sortDirection || filters.direction || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let orderClause = 'p.created_date DESC';
    if (sortField === 'createdAt' || sortField === 'createdDate' || sortField === 'created_date') {
      orderClause = `p.created_date ${sortDir}`;
    } else if (sortField === 'price' || sortField === 'pricePerUnit') {
      orderClause = `p.price ${sortDir}`;
    } else if (sortField === 'name') {
      orderClause = `p.name ${sortDir}`;
    }

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

      if (sellerId) {
        conditions.push(`p.farmer_id = $${pIdx++}`);
        params.push(sellerId);
      }

      if (search) {
        conditions.push(`(LOWER(p.name) LIKE $${pIdx} OR LOWER(p.description) LIKE $${pIdx})`);
        params.push(`%${search}%`);
        pIdx++;
      }

      if (minPrice !== null) {
        conditions.push(`p.price >= $${pIdx++}`);
        params.push(minPrice);
      }

      if (maxPrice !== null) {
        conditions.push(`p.price <= $${pIdx++}`);
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
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN users u ON u.id = p.farmer_id
         ${whereClause}
         ORDER BY ${orderClause}
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
      if (sellerId && (p.farmer_id || p.seller_id) !== sellerId) return false;
      const pPrice = p.price ?? p.price_per_unit ?? 0;
      if (minPrice !== null && pPrice < minPrice) return false;
      if (maxPrice !== null && pPrice > maxPrice) return false;
      if (search) {
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesDesc = p.description?.toLowerCase().includes(search);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });

    if (sortField === 'price' || sortField === 'pricePerUnit') {
      list.sort((a, b) => {
        const pa = a.price ?? a.price_per_unit ?? 0;
        const pb = b.price ?? b.price_per_unit ?? 0;
        return sortDir === 'ASC' ? pa - pb : pb - pa;
      });
    } else if (sortField === 'name') {
      list.sort((a, b) => {
        return sortDir === 'ASC' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
    } else {
      list.sort((a, b) => {
        const da = new Date(a.created_date).getTime();
        const dbTime = new Date(b.created_date).getTime();
        return sortDir === 'ASC' ? da - dbTime : dbTime - da;
      });
    }

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
    const productSeller = existing.sellerId || (existing as any).farmerId;
    if (!isAdmin && productSeller !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED', 'You do not have permission to modify this product.');
    }

    if (isPostgres()) {
      await db.query(
        `UPDATE products SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          unit = COALESCE($4, unit),
          status = COALESCE($5, status),
          last_modified_date = $6
        WHERE id = $7`,
        [
          data.name?.trim() || null,
          data.description !== undefined ? data.description : null,
          data.pricePerUnit ?? data.price ?? null,
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
    const newPrice = data.pricePerUnit ?? data.price;
    if (newPrice !== undefined) {
      prod.price = newPrice;
      prod.price_per_unit = newPrice;
    }
    if (data.unit) prod.unit = data.unit.trim();
    if (data.status) prod.status = data.status;
    prod.last_modified_date = new Date();

    return this.enrichMemoryProduct(prod);
  }

  async deleteProduct(sellerId: string, productId: string, isAdmin = false): Promise<void> {
    const existing = await this.getProductById(productId);
    const productSeller = existing.sellerId || (existing as any).farmerId;
    if (!isAdmin && productSeller !== sellerId) {
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
    return (prod as any).locationDetails || { location: prod.location };
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
      primary: !!i.is_primary,
      displayOrder: i.display_order,
    }));

    // Inventory
    const invRes = await db.query('SELECT * FROM inventory WHERE product_id = $1', [row.id]);
    const inv = invRes.rows[0];
    const totalQty = inv ? parseFloat(inv.total_quantity ?? inv.quantity ?? 0) : 0;
    const reservedQty = inv ? parseFloat(inv.reserved_quantity ?? 0) : 0;
    const availableQty = Math.max(0, totalQty - reservedQty);
    const inventory = inv
      ? {
          id: inv.id,
          productId: inv.product_id,
          quantity: totalQty,
          totalQuantity: totalQty,
          reservedQuantity: reservedQty,
          availableQuantity: availableQty,
          lastRestockedAt: inv.updated_at || inv.created_at || null,
        }
      : undefined;

    // Location
    let loc = null;
    if (row.product_location_snapshot_id) {
      const locRes = await db.query(
        `SELECT pls.*, t.name as taluk_name, d.name as district_name, s.name as state_name
         FROM product_location_snapshots pls
         LEFT JOIN taluks t ON t.id = pls.taluk_id
         LEFT JOIN districts d ON d.id = t.district_id
         LEFT JOIN states s ON s.id = d.state_id
         WHERE pls.id = $1`,
        [row.product_location_snapshot_id]
      );
      loc = locRes.rows[0];
    }
    if (!loc) {
      const fallbackRes = await db.query(
        `SELECT pls.*, t.name as taluk_name, d.name as district_name, s.name as state_name
         FROM product_location_snapshots pls
         LEFT JOIN taluks t ON t.id = pls.taluk_id
         LEFT JOIN districts d ON d.id = t.district_id
         LEFT JOIN states s ON s.id = d.state_id
         WHERE pls.id = $1`,
        [row.id]
      );
      loc = fallbackRes.rows[0];
    }

    const locationString = loc
      ? [loc.village || loc.address_line1, loc.taluk_name, loc.district_name, loc.state_name]
          .filter(Boolean)
          .join(', ') || loc.city || 'Karnataka, India'
      : (typeof row.location === 'string' && row.location ? row.location : 'Karnataka, India');

    const locationDetails = loc
      ? {
          id: loc.id,
          productId: row.id,
          talukId: loc.taluk_id,
          taluk: loc.taluk_name,
          district: loc.district_name,
          state: loc.state_name,
          villageOrTown: loc.village || loc.address_line1,
          pinCode: loc.pincode,
          latitude: loc.latitude ? parseFloat(loc.latitude) : null,
          longitude: loc.longitude ? parseFloat(loc.longitude) : null,
        }
      : undefined;

    const price = parseFloat(row.price ?? row.price_per_unit ?? 0);
    const sellerId = row.farmer_id || row.seller_id;
    const sellerName = row.seller_name || 'Farmer';

    return {
      id: row.id,
      categoryId: row.category_id,
      category_id: row.category_id,
      categoryName: row.category_name,
      category_name: row.category_name,
      sellerId,
      seller_id: sellerId,
      farmerId: sellerId,
      farmer_id: sellerId,
      sellerName,
      farmerName: sellerName,
      name: row.name,
      description: row.description,
      badge: row.badge,
      mandiLinkedCommodity: row.mandi_linked_commodity || row.mandiLinkedCommodity,
      isMandiLinked: Boolean(row.mandi_linked_commodity || row.mandiLinkedCommodity),
      isRentalAvailable: Boolean(row.is_rental_available || row.isRentalAvailable),
      rentalRate: row.rental_rate ? parseFloat(row.rental_rate) : row.rentalRate,
      rentalUnit: row.rental_unit || row.rentalUnit,
      listingType: row.listing_type || row.listingType || 'BUY',
      price,
      pricePerUnit: price,
      price_per_unit: price,
      unit: row.unit,
      quantity: availableQty,
      availableQuantity: availableQty,
      totalQuantity: totalQty,
      status: row.status,
      location: locationString,
      locationDetails,
      images,
      imageUrl: images[0]?.imageUrl,
      inventory,
      createdDate: row.created_date || row.created_at,
      lastModifiedDate: row.last_modified_date || row.updated_at,
      createdAt: row.created_date || row.created_at,
      updatedAt: row.last_modified_date || row.updated_at,
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
        primary: !!i.is_primary,
        displayOrder: i.display_order,
      }));

    const inv = memoryDb.inventory.find((i) => i.product_id === prod.id);
    const totalQty = inv ? (inv.total_quantity ?? inv.quantity ?? 0) : 0;
    const reservedQty = inv ? (inv.reserved_quantity ?? 0) : 0;
    const availableQty = Math.max(0, totalQty - reservedQty);
    const inventory = inv
      ? {
          id: inv.id,
          productId: inv.product_id,
          quantity: totalQty,
          totalQuantity: totalQty,
          reservedQuantity: reservedQty,
          availableQuantity: availableQty,
          lastRestockedAt: inv.last_restocked_at || inv.updated_at,
        }
      : undefined;

    const loc = memoryDb.product_location_snapshots.find((l) => l.product_id === prod.id || l.id === prod.product_location_snapshot_id);
    let locationDetails = undefined;
    let locationString = 'Karnataka, India';
    if (loc) {
      const taluk = memoryDb.taluks.find((t) => t.id === loc.taluk_id);
      const dist = taluk
        ? memoryDb.districts.find((d) => d.id === taluk.district_id)
        : (loc.district ? { name: loc.district } : null);
      const state = dist && (dist as any).state_id
        ? memoryDb.states.find((s) => s.id === (dist as any).state_id)
        : (loc.state ? { name: loc.state } : null);
      locationDetails = {
        id: loc.id,
        productId: loc.product_id,
        talukId: loc.taluk_id,
        taluk: taluk?.name,
        district: dist?.name || loc.district,
        state: state?.name || loc.state,
        villageOrTown: loc.village_or_town || loc.village,
        pinCode: loc.pin_code || loc.pincode,
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
      locationString = [loc.village_or_town || loc.village, taluk?.name, dist?.name || loc.district, state?.name || loc.state]
        .filter(Boolean)
        .join(', ') || 'India';
    } else if (typeof prod.location === 'string' && prod.location) {
      locationString = prod.location;
    }

    const cat = memoryDb.categories.find((c) => c.id === prod.category_id);
    const seller = memoryDb.users.find((u) => u.id === (prod.farmer_id || prod.seller_id));
    const price = prod.price ?? prod.price_per_unit ?? 0;
    const sellerId = prod.farmer_id || prod.seller_id;
    const sellerName = prod.seller_name || prod.farmer_name || seller?.full_name || 'Farmer';

    return {
      id: prod.id,
      categoryId: prod.category_id,
      category_id: prod.category_id,
      categoryName: cat?.name,
      category_name: cat?.name,
      sellerId,
      seller_id: sellerId,
      farmerId: sellerId,
      farmer_id: sellerId,
      sellerName,
      farmerName: sellerName,
      name: prod.name,
      description: prod.description,
      badge: prod.badge,
      mandiLinkedCommodity: prod.mandiLinkedCommodity,
      isMandiLinked: Boolean(prod.mandiLinkedCommodity || prod.isMandiLinked),
      isRentalAvailable: Boolean(prod.isRentalAvailable),
      rentalRate: prod.rentalRate,
      rentalUnit: prod.rentalUnit,
      listingType: prod.listingType || 'BUY',
      price,
      pricePerUnit: price,
      price_per_unit: price,
      unit: prod.unit,
      quantity: availableQty,
      availableQuantity: availableQty,
      totalQuantity: totalQty,
      status: prod.status,
      location: locationString,
      locationDetails,
      images,
      imageUrl: images[0]?.imageUrl || prod.imageUrl,
      inventory,
      createdDate: prod.created_date,
      lastModifiedDate: prod.last_modified_date,
      createdAt: prod.created_date,
      updatedAt: prod.last_modified_date,
    };
  }
}

export const productService = new ProductService();
