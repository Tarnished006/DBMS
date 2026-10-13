import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { OrderDto, OrderStatus } from '../types/index.js';
import { addressService } from './address.service.js';
import { productService } from './product.service.js';
import { inventoryService } from './inventory.service.js';

export class OrderService {
  async createOrder(buyerId: string, data: any): Promise<OrderDto> {
    const items = data.items || [];
    if (items.length === 0) {
      throw new BusinessException('VALIDATION_ERROR', 'Order must contain at least one item');
    }

    // 1. Resolve Address
    let addressSnapshotData: any = null;
    if (data.addressId) {
      const addr = await addressService.getAddressById(buyerId, data.addressId);
      addressSnapshotData = {
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        landmark: addr.landmark,
        talukId: addr.talukId,
        pinCode: addr.pinCode,
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
    } else if (data.shippingAddress) {
      addressSnapshotData = data.shippingAddress;
    } else {
      const addresses = await addressService.getUserAddresses(buyerId);
      if (addresses.length === 0) {
        throw new BusinessException('ADDRESS_NOT_FOUND', 'No shipping address specified');
      }
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      addressSnapshotData = {
        addressLine1: def.addressLine1,
        addressLine2: def.addressLine2,
        landmark: def.landmark,
        talukId: def.talukId,
        pinCode: def.pinCode,
        latitude: def.latitude,
        longitude: def.longitude,
      };
    }

    // 2. Validate Items & Availability
    const enrichedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    let totalAmount = 0;

    for (const item of items) {
      const prod = await productService.getProductById(item.productId);
      const avail = await inventoryService.checkAvailability(item.productId, item.quantity);
      if (!avail.available) {
        throw new BusinessException(
          'INSUFFICIENT_STOCK',
          `Insufficient stock available for ${prod.name}`
        );
      }

      const unitPrice = prod.pricePerUnit;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      enrichedItems.push({
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    const deliveryFee = totalAmount > 2000 ? 0 : 150;
    const finalAmount = totalAmount + deliveryFee;

    const orderId = uuidv4();
    const now = new Date();

    if (isPostgres()) {
      // 1. Create order
      await db.query(
        `INSERT INTO orders (id, buyer_id, status, created_date, last_modified_date)
         VALUES ($1, $2, 'PENDING', $3, $3)`,
        [orderId, buyerId, now]
      );

      // 2. Insert items
      for (const it of enrichedItems) {
        await db.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, created_date, last_modified_date)
           VALUES ($1, $2, $3, $4, $5, $6, $6)`,
          [uuidv4(), orderId, it.productId, it.quantity, it.unitPrice, now]
        );

        // Reserve inventory
        await db.query(
          'UPDATE inventory SET reserved_quantity = reserved_quantity + $1 WHERE product_id = $2',
          [it.quantity, it.productId]
        );
      }

      // 3. Address snapshot
      await db.query(
        `INSERT INTO order_address_snapshots (
          id, order_id, address_line1, address_line2, landmark, taluk_id, pin_code, latitude, longitude, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
        [
          uuidv4(),
          orderId,
          addressSnapshotData.addressLine1,
          addressSnapshotData.addressLine2 || null,
          addressSnapshotData.landmark || null,
          addressSnapshotData.talukId,
          addressSnapshotData.pinCode,
          addressSnapshotData.latitude || null,
          addressSnapshotData.longitude || null,
          now,
        ]
      );

      // 4. Payment
      await db.query(
        `INSERT INTO payments (id, order_id, amount, currency, provider, status, created_date, last_modified_date)
         VALUES ($1, $2, $3, 'INR', 'MOCK', 'PENDING', $4, $4)`,
        [uuidv4(), orderId, finalAmount, now]
      );

      // 5. Delivery
      await db.query(
        `INSERT INTO deliveries (
          id, order_id, status, tracking_number, carrier_name, otp_verified, created_date, last_modified_date
        ) VALUES ($1, $2, 'PENDING', $3, 'AgriDirect Express', false, $4, $4)`,
        [uuidv4(), orderId, `TRK-${Date.now().toString(36).toUpperCase()}`, now]
      );
    } else {
      memoryDb.orders.push({
        id: orderId,
        buyer_id: buyerId,
        status: 'PENDING',
        created_date: now,
        last_modified_date: now,
      });

      for (const it of enrichedItems) {
        memoryDb.order_items.push({
          id: uuidv4(),
          order_id: orderId,
          product_id: it.productId,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          created_date: now,
          last_modified_date: now,
        });

        const inv = memoryDb.inventory.find((i) => i.product_id === it.productId);
        if (inv) inv.reserved_quantity += it.quantity;
      }

      memoryDb.order_address_snapshots.push({
        id: uuidv4(),
        order_id: orderId,
        address_line1: addressSnapshotData.addressLine1,
        address_line2: addressSnapshotData.addressLine2 || null,
        landmark: addressSnapshotData.landmark || null,
        taluk_id: addressSnapshotData.talukId,
        pin_code: addressSnapshotData.pinCode,
        latitude: addressSnapshotData.latitude || null,
        longitude: addressSnapshotData.longitude || null,
        created_date: now,
        last_modified_date: now,
      });

      memoryDb.payments.push({
        id: uuidv4(),
        order_id: orderId,
        amount: finalAmount,
        currency: 'INR',
        provider: 'MOCK',
        status: 'PENDING',
        created_date: now,
        last_modified_date: now,
      });

      memoryDb.deliveries.push({
        id: uuidv4(),
        order_id: orderId,
        status: 'PENDING',
        tracking_number: `TRK-${Date.now().toString(36).toUpperCase()}`,
        carrier_name: 'AgriDirect Express',
        otp_verified: false,
        created_date: now,
        last_modified_date: now,
      });
    }

    return this.getOrderById(orderId, buyerId, true);
  }

  async getOrderById(orderId: string, userId: string, isAdmin = false): Promise<OrderDto> {
    let order: any = null;

    if (isPostgres()) {
      const res = await db.query(
        `SELECT o.*, u.full_name as buyer_name, u.email as buyer_email
         FROM orders o
         JOIN users u ON u.id = o.buyer_id
         WHERE o.id = $1`,
        [orderId]
      );
      if (res.rows.length === 0) throw new BusinessException('ORDER_NOT_FOUND');
      order = res.rows[0];
    } else {
      order = memoryDb.orders.find((o) => o.id === orderId);
      if (!order) throw new BusinessException('ORDER_NOT_FOUND');
      const user = memoryDb.users.find((u) => u.id === order.buyer_id);
      order = { ...order, buyer_name: user?.full_name, buyer_email: user?.email };
    }

    if (!isAdmin && order.buyer_id !== userId) {
      throw new BusinessException('ORDER_ACCESS_DENIED');
    }

    return this.enrichOrder(order);
  }

  async getUserOrders(buyerId: string): Promise<OrderDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT o.*, u.full_name as buyer_name, u.email as buyer_email
         FROM orders o
         JOIN users u ON u.id = o.buyer_id
         WHERE o.buyer_id = $1
         ORDER BY o.created_date DESC`,
        [buyerId]
      );
      return Promise.all(res.rows.map((r: any) => this.enrichOrder(r)));
    }

    const list = memoryDb.orders.filter((o) => o.buyer_id === buyerId);
    return Promise.all(list.map((o) => this.enrichOrder(o)));
  }

  async getAllOrders(filters: any = {}): Promise<OrderDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT o.*, u.full_name as buyer_name, u.email as buyer_email
         FROM orders o
         JOIN users u ON u.id = o.buyer_id
         ORDER BY o.created_date DESC`
      );
      return Promise.all(res.rows.map((r: any) => this.enrichOrder(r)));
    }
    return Promise.all(memoryDb.orders.map((o) => this.enrichOrder(o)));
  }

  async getOrderAddress(orderId: string) {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT oas.*, t.name as taluk_name, d.name as district_name, s.name as state_name
         FROM order_address_snapshots oas
         JOIN taluks t ON t.id = oas.taluk_id
         JOIN districts d ON d.id = t.district_id
         JOIN states s ON s.id = d.state_id
         WHERE oas.order_id = $1`,
        [orderId]
      );
      if (res.rows.length === 0) throw new BusinessException('ORDER_NOT_FOUND');
      const r = res.rows[0];
      return {
        id: r.id,
        orderId: r.order_id,
        addressLine1: r.address_line1,
        addressLine2: r.address_line2,
        landmark: r.landmark,
        talukId: r.taluk_id,
        taluk: r.taluk_name,
        district: r.district_name,
        state: r.state_name,
        pinCode: r.pin_code,
        latitude: r.latitude ? parseFloat(r.latitude) : null,
        longitude: r.longitude ? parseFloat(r.longitude) : null,
      };
    }

    const r = memoryDb.order_address_snapshots.find((o) => o.order_id === orderId);
    if (!r) throw new BusinessException('ORDER_NOT_FOUND');
    const taluk = memoryDb.taluks.find((t) => t.id === r.taluk_id);
    const dist = taluk ? memoryDb.districts.find((d) => d.id === taluk.district_id) : null;
    const state = dist ? memoryDb.states.find((s) => s.id === dist.state_id) : null;
    return {
      id: r.id,
      orderId: r.order_id,
      addressLine1: r.address_line1,
      addressLine2: r.address_line2,
      landmark: r.landmark,
      talukId: r.taluk_id,
      taluk: taluk?.name,
      district: dist?.name,
      state: state?.name,
      pinCode: r.pin_code,
      latitude: r.latitude,
      longitude: r.longitude,
    };
  }

  async updateOrderStatus(orderId: string, targetStatus: OrderStatus, isAdmin = false): Promise<OrderDto> {
    const order = await this.getOrderById(orderId, '', true);

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status]?.includes(targetStatus)) {
      throw new BusinessException(
        'ORDER_INVALID_STATUS_TRANSITION',
        `Invalid status transition: Cannot change order from ${order.status} to ${targetStatus}`
      );
    }

    const now = new Date();

    if (isPostgres()) {
      await db.query('UPDATE orders SET status = $1, last_modified_date = $2 WHERE id = $3', [
        targetStatus,
        now,
        orderId,
      ]);
    } else {
      const o = memoryDb.orders.find((m) => m.id === orderId);
      if (o) {
        o.status = targetStatus;
        o.last_modified_date = now;
      }
    }

    // Status consequence side-effects
    if (targetStatus === 'DELIVERED') {
      // Deduct reserved quantity permanently from physical inventory
      for (const it of order.items) {
        if (isPostgres()) {
          await db.query(
            `UPDATE inventory
             SET total_quantity = GREATEST(0, total_quantity - $1),
                 reserved_quantity = GREATEST(0, reserved_quantity - $1),
                 updated_at = $2
             WHERE product_id = $3`,
            [it.quantity, now, it.productId]
          );
        } else {
          const inv = memoryDb.inventory.find((i) => i.product_id === it.productId);
          if (inv) {
            inv.quantity = Math.max(0, (inv.quantity ?? inv.total_quantity) - it.quantity);
            inv.total_quantity = Math.max(0, (inv.total_quantity ?? inv.quantity) - it.quantity);
            inv.reserved_quantity = Math.max(0, inv.reserved_quantity - it.quantity);
          }
        }
      }
    } else if (targetStatus === 'CANCELLED') {
      // Release inventory reservations
      for (const it of order.items) {
        if (isPostgres()) {
          await db.query(
            `UPDATE inventory
             SET reserved_quantity = GREATEST(0, reserved_quantity - $1),
                 updated_at = $2
             WHERE product_id = $3`,
            [it.quantity, now, it.productId]
          );
        } else {
          const inv = memoryDb.inventory.find((i) => i.product_id === it.productId);
          if (inv) {
            inv.reserved_quantity = Math.max(0, inv.reserved_quantity - it.quantity);
          }
        }
      }
    }

    return this.getOrderById(orderId, '', true);
  }

  async cancelOrder(orderId: string, userId: string, isAdmin = false): Promise<OrderDto> {
    const order = await this.getOrderById(orderId, userId, isAdmin);
    if (!isAdmin && order.buyerId !== userId) {
      throw new BusinessException('ORDER_ACCESS_DENIED');
    }
    return this.updateOrderStatus(orderId, 'CANCELLED', isAdmin);
  }

  async getOrderTracking(orderId: string, userId: string, isAdmin = false) {
    const order = await this.getOrderById(orderId, userId, isAdmin);
    return {
      orderId: order.id,
      status: order.status,
      delivery: order.delivery,
      createdDate: order.createdDate,
    };
  }

  private async enrichOrder(row: any): Promise<OrderDto> {
    // 1. Items
    let items: any[] = [];
    if (isPostgres()) {
      const res = await db.query(
        `SELECT oi.*, p.name as product_name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [row.id]
      );
      items = res.rows.map((r: any) => ({
        id: r.id,
        orderId: r.order_id,
        productId: r.product_id,
        productName: r.product_name,
        quantity: r.quantity,
        unitPrice: parseFloat(r.unit_price),
        subtotal: r.quantity * parseFloat(r.unit_price),
      }));
    } else {
      items = memoryDb.order_items
        .filter((oi) => oi.order_id === row.id)
        .map((oi) => {
          const prod = memoryDb.products.find((p) => p.id === oi.product_id);
          return {
            id: oi.id,
            orderId: oi.order_id,
            productId: oi.product_id,
            productName: prod?.name,
            quantity: oi.quantity,
            unitPrice: oi.unit_price,
            subtotal: oi.quantity * oi.unit_price,
          };
        });
    }

    // 2. Address Snapshot
    let addressSnapshot: any = undefined;
    try {
      addressSnapshot = await this.getOrderAddress(row.id);
    } catch {}

    // 3. Payment
    let payment: any = undefined;
    if (isPostgres()) {
      const pRes = await db.query('SELECT * FROM payments WHERE order_id = $1', [row.id]);
      if (pRes.rows.length > 0) {
        const p = pRes.rows[0];
        payment = {
          id: p.id,
          orderId: p.order_id,
          amount: parseFloat(p.amount),
          currency: p.currency,
          provider: p.provider,
          status: p.status,
          createdDate: p.created_date,
          lastModifiedDate: p.last_modified_date,
        };
      }
    } else {
      const p = memoryDb.payments.find((pm) => pm.order_id === row.id);
      if (p) {
        payment = {
          id: p.id,
          orderId: p.order_id,
          amount: p.amount,
          currency: p.currency,
          provider: p.provider,
          status: p.status,
          createdDate: p.created_date,
          lastModifiedDate: p.last_modified_date,
        };
      }
    }

    // 4. Delivery
    let delivery: any = undefined;
    if (isPostgres()) {
      const dRes = await db.query('SELECT * FROM deliveries WHERE order_id = $1', [row.id]);
      if (dRes.rows.length > 0) {
        const d = dRes.rows[0];
        delivery = {
          id: d.id,
          orderId: d.order_id,
          status: d.status,
          trackingNumber: d.tracking_number,
          carrierName: d.carrier_name,
          otpVerified: !!d.otp_verified,
          estimatedDeliveryDate: d.estimated_delivery_date,
          actualDeliveryDate: d.actual_delivery_date,
          createdDate: d.created_date,
          lastModifiedDate: d.last_modified_date,
        };
      }
    } else {
      const d = memoryDb.deliveries.find((dl) => dl.order_id === row.id);
      if (d) {
        delivery = {
          id: d.id,
          orderId: d.order_id,
          status: d.status,
          trackingNumber: d.tracking_number,
          carrierName: d.carrier_name,
          otpVerified: !!d.otp_verified,
          estimatedDeliveryDate: d.estimated_delivery_date,
          actualDeliveryDate: d.actual_delivery_date,
          createdDate: d.created_date,
          lastModifiedDate: d.last_modified_date,
        };
      }
    }

    const itemsTotal = items.reduce((sum, it) => sum + it.subtotal, 0);
    const deliveryFee = itemsTotal > 2000 ? 0 : 150;

    return {
      id: row.id,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name,
      buyerEmail: row.buyer_email,
      status: row.status,
      createdDate: row.created_date,
      lastModifiedDate: row.last_modified_date,
      items,
      totalAmount: itemsTotal + deliveryFee,
      deliveryFee,
      addressSnapshot,
      payment,
      delivery,
    };
  }
}

export const orderService = new OrderService();
