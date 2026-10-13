import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { InventoryDto } from '../types/index.js';
import { productService } from './product.service.js';

export class InventoryService {
  async getProductInventory(productId: string): Promise<InventoryDto> {
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM inventory WHERE product_id = $1', [productId]);
      if (res.rows.length === 0) throw new BusinessException('INVENTORY_NOT_FOUND');
      return this.mapInventory(res.rows[0]);
    }
    const inv = memoryDb.inventory.find((i) => i.product_id === productId);
    if (!inv) throw new BusinessException('INVENTORY_NOT_FOUND');
    return this.mapInventory(inv);
  }

  async checkAvailability(productId: string, quantity: number): Promise<{
    available: boolean;
    availableQuantity: number;
  }> {
    const inv = await this.getProductInventory(productId);
    return {
      available: inv.availableQuantity >= quantity,
      availableQuantity: inv.availableQuantity,
    };
  }

  async getMyInventory(sellerId: string): Promise<InventoryDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT i.* FROM inventory i
         JOIN products p ON p.id = i.product_id
         WHERE p.seller_id = $1`,
        [sellerId]
      );
      return res.rows.map(this.mapInventory);
    }

    const myProdIds = new Set(
      memoryDb.products.filter((p) => p.seller_id === sellerId).map((p) => p.id)
    );
    return memoryDb.inventory
      .filter((i) => myProdIds.has(i.product_id))
      .map(this.mapInventory);
  }

  async updateInventory(
    sellerId: string,
    productId: string,
    newQuantity: number,
    isAdmin = false
  ): Promise<InventoryDto> {
    const prod = await productService.getProductById(productId);
    if (!isAdmin && prod.sellerId !== sellerId) {
      throw new BusinessException('PRODUCT_ACCESS_DENIED');
    }

    const current = await this.getProductInventory(productId);
    if (newQuantity < current.reservedQuantity) {
      throw new BusinessException(
        'INVENTORY_QUANTITY_LESS_THAN_RESERVED',
        'Inventory Rule Violation: The requested stock deduction cannot be applied because the remaining quantity would be less than the stock reserved for pending customer orders.'
      );
    }

    const now = new Date();
    if (isPostgres()) {
      await db.query(
        'UPDATE inventory SET quantity = $1, last_restocked_at = $2, last_modified_date = $2 WHERE product_id = $3',
        [newQuantity, now, productId]
      );
      return this.getProductInventory(productId);
    }

    const mem = memoryDb.inventory.find((i) => i.product_id === productId);
    if (!mem) throw new BusinessException('INVENTORY_NOT_FOUND');
    mem.quantity = newQuantity;
    mem.last_restocked_at = now;
    mem.last_modified_date = now;
    return this.mapInventory(mem);
  }

  async addStock(sellerId: string, productId: string, amount: number, isAdmin = false): Promise<InventoryDto> {
    const current = await this.getProductInventory(productId);
    return this.updateInventory(sellerId, productId, current.quantity + amount, isAdmin);
  }

  async removeStock(sellerId: string, productId: string, amount: number, isAdmin = false): Promise<InventoryDto> {
    const current = await this.getProductInventory(productId);
    if (amount > current.availableQuantity) {
      throw new BusinessException(
        'INVENTORY_INSUFFICIENT_STOCK',
        'Inventory Rule Violation: Insufficient physical stock available to complete this deduction.'
      );
    }
    return this.updateInventory(sellerId, productId, current.quantity - amount, isAdmin);
  }

  private mapInventory(row: any): InventoryDto {
    const qty = parseInt(row.quantity, 10);
    const res = parseInt(row.reserved_quantity, 10);
    return {
      id: row.id,
      productId: row.product_id,
      quantity: qty,
      reservedQuantity: res,
      availableQuantity: Math.max(0, qty - res),
      lastRestockedAt: row.last_restocked_at,
    };
  }
}

export const inventoryService = new InventoryService();
