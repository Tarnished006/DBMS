import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb, saveMemoryDbSnapshot } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { NegotiationDto } from '../types/index.js';
import { notificationService } from './notification.service.js';

export class NegotiationService {
  async createOffer(
    buyerId: string,
    data: {
      produceId?: string;
      productId?: string;
      quantity?: number;
      proposedQuantity?: number;
      proposedPrice: number;
      unit?: string;
      buyerNotes?: string;
      notes?: string;
    }
  ): Promise<NegotiationDto> {
    const produceId = (data.produceId || data.productId)?.trim();
    const quantity = Number(data.quantity || data.proposedQuantity);
    const proposedPrice = Number(data.proposedPrice);
    const buyerNotes = (data.buyerNotes || data.notes)?.trim();

    if (!produceId || !quantity || !proposedPrice) {
      throw new BusinessException('INVALID_REQUEST', 'Produce ID, quantity, and proposed price are required');
    }

    if (quantity <= 0 || proposedPrice <= 0) {
      throw new BusinessException('INVALID_REQUEST', 'Quantity and price must be greater than zero');
    }

    let farmerId = '';
    let produceName = '';
    let currentPrice = 0;

    if (isPostgres()) {
      const pRes = await db.query('SELECT id, seller_id, name, price_per_unit FROM products WHERE id = $1', [
        produceId,
      ]);
      if (pRes.rows.length === 0) {
        throw new BusinessException('PRODUCT_NOT_FOUND', 'Selected produce not found');
      }
      farmerId = pRes.rows[0].seller_id;
      produceName = pRes.rows[0].name;
      currentPrice = parseFloat(pRes.rows[0].price_per_unit);
    } else {
      const p = memoryDb.products.find((prod) => prod.id === produceId);
      if (!p) {
        throw new BusinessException('PRODUCT_NOT_FOUND', 'Selected produce not found');
      }
      farmerId = p.farmer_id || p.seller_id;
      produceName = p.name;
      currentPrice = p.price_per_unit;
    }

    if (farmerId === buyerId) {
      throw new BusinessException('ACCESS_DENIED', 'You cannot negotiate with your own listing');
    }

    const id = uuidv4();
    const now = new Date();
    const unit = data.unit || 'KG';

    if (isPostgres()) {
      await db.query(
        `INSERT INTO negotiations (
          id, produce_id, buyer_id, farmer_id, quantity, unit,
          proposed_price, status, buyer_notes, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9, $9)`,
        [
          id,
          produceId,
          buyerId,
          farmerId,
          quantity,
          unit,
          proposedPrice,
          buyerNotes || null,
          now,
        ]
      );
    } else {
      memoryDb.negotiations.push({
        id,
        produce_id: produceId,
        buyer_id: buyerId,
        farmer_id: farmerId,
        quantity,
        unit,
        proposed_price: proposedPrice,
        counter_price: null,
        final_price: null,
        status: 'PENDING',
        buyer_notes: buyerNotes || null,
        farmer_notes: null,
        created_date: now,
        last_modified_date: now,
      });
      saveMemoryDbSnapshot();
    }

    notificationService.createNotification(
      farmerId,
      'NEGOTIATION',
      'New Price Offer Received 🤝',
      `A buyer offered ₹${proposedPrice} for ${quantity} ${unit || 'KG'} of ${produceName}.`,
      '/dashboard/negotiations',
      { negotiationId: id, produceName, proposedPrice, quantity }
    ).catch(() => {});

    return this.getNegotiationById(id);
  }

  async getNegotiationById(id: string): Promise<NegotiationDto> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT n.*,
                p.name as produce_name, p.price_per_unit as produce_price,
                b.full_name as buyer_name, b.email as buyer_email, b.phone_number as buyer_phone,
                f.full_name as farmer_name, f.phone_number as farmer_phone
         FROM negotiations n
         LEFT JOIN products p ON p.id = n.produce_id
         LEFT JOIN users b ON b.id = n.buyer_id
         LEFT JOIN users f ON f.id = n.farmer_id
         WHERE n.id = $1`,
        [id]
      );
      if (res.rows.length === 0) {
        throw new BusinessException('RESOURCE_NOT_FOUND', 'Negotiation record not found');
      }
      return this.mapDbNegotiation(res.rows[0]);
    }

    const n = memoryDb.negotiations.find((neg) => neg.id === id);
    if (!n) {
      throw new BusinessException('RESOURCE_NOT_FOUND', 'Negotiation record not found');
    }
    return this.mapMemoryNegotiation(n);
  }

  async getMyFarmerNegotiations(farmerId: string): Promise<NegotiationDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT n.*,
                p.name as produce_name, p.price_per_unit as produce_price,
                b.full_name as buyer_name, b.email as buyer_email, b.phone_number as buyer_phone,
                f.full_name as farmer_name, f.phone_number as farmer_phone
         FROM negotiations n
         LEFT JOIN products p ON p.id = n.produce_id
         LEFT JOIN users b ON b.id = n.buyer_id
         LEFT JOIN users f ON f.id = n.farmer_id
         WHERE n.farmer_id = $1
         ORDER BY n.created_date DESC`,
        [farmerId]
      );
      return res.rows.map(this.mapDbNegotiation);
    }

    const list = memoryDb.negotiations.filter((neg) => neg.farmer_id === farmerId);
    return list.map(this.mapMemoryNegotiation);
  }

  async getMyBuyerNegotiations(buyerId: string): Promise<NegotiationDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT n.*,
                p.name as produce_name, p.price_per_unit as produce_price,
                b.full_name as buyer_name, b.email as buyer_email, b.phone_number as buyer_phone,
                f.full_name as farmer_name, f.phone_number as farmer_phone
         FROM negotiations n
         LEFT JOIN products p ON p.id = n.produce_id
         LEFT JOIN users b ON b.id = n.buyer_id
         LEFT JOIN users f ON f.id = n.farmer_id
         WHERE n.buyer_id = $1
         ORDER BY n.created_date DESC`,
        [buyerId]
      );
      return res.rows.map(this.mapDbNegotiation);
    }

    const list = memoryDb.negotiations.filter((neg) => neg.buyer_id === buyerId);
    return list.map(this.mapMemoryNegotiation);
  }

  async counterOffer(
    farmerId: string,
    negotiationId: string,
    counterPrice: number,
    farmerNotes?: string
  ): Promise<NegotiationDto> {
    if (!counterPrice || counterPrice <= 0) {
      throw new BusinessException('INVALID_REQUEST', 'Counter price must be positive');
    }

    const n = await this.getNegotiationById(negotiationId);
    if (n.farmerId !== farmerId) {
      throw new BusinessException('ACCESS_DENIED', 'Only the farmer can counter-offer this proposal');
    }
    if (n.status !== 'PENDING') {
      throw new BusinessException('INVALID_REQUEST', `Cannot counter-offer when status is ${n.status}`);
    }

    const now = new Date();
    if (isPostgres()) {
      await db.query(
        `UPDATE negotiations
         SET counter_price = $1, farmer_notes = $2, status = 'COUNTERED', last_modified_date = $3
         WHERE id = $4`,
        [counterPrice, farmerNotes?.trim() || null, now, negotiationId]
      );
    } else {
      const mem = memoryDb.negotiations.find((neg) => neg.id === negotiationId);
      if (mem) {
        mem.counter_price = counterPrice;
        mem.farmer_notes = farmerNotes?.trim() || null;
        mem.status = 'COUNTERED';
        mem.last_modified_date = now;
        saveMemoryDbSnapshot();
      }
    }

    notificationService.createNotification(
      n.buyerId,
      'NEGOTIATION',
      'Counter-Offer Received 🤝',
      `Farmer counter-offered ₹${counterPrice} for ${n.produceName}.`,
      '/dashboard/negotiations',
      { negotiationId, produceName: n.produceName, counterPrice }
    ).catch(() => {});

    return this.getNegotiationById(negotiationId);
  }

  async acceptOffer(userId: string, negotiationId: string): Promise<NegotiationDto> {
    const n = await this.getNegotiationById(negotiationId);
    const now = new Date();
    let finalPrice = 0;

    if (n.status === 'PENDING') {
      // Farmer accepts buyer's original proposed price
      if (n.farmerId !== userId) {
        throw new BusinessException('ACCESS_DENIED', 'Only the farmer can accept the initial offer');
      }
      finalPrice = n.proposedPrice;
    } else if (n.status === 'COUNTERED') {
      // Buyer accepts farmer's counter-offer
      if (n.buyerId !== userId) {
        throw new BusinessException('ACCESS_DENIED', 'Only the buyer can accept the counter-offer');
      }
      finalPrice = n.counterPrice || n.proposedPrice;
    } else {
      throw new BusinessException('INVALID_REQUEST', `Offer cannot be accepted from state: ${n.status}`);
    }

    if (isPostgres()) {
      await db.query(
        `UPDATE negotiations
         SET status = 'ACCEPTED', final_price = $1, last_modified_date = $2
         WHERE id = $3`,
        [finalPrice, now, negotiationId]
      );
    } else {
      const mem = memoryDb.negotiations.find((neg) => neg.id === negotiationId);
      if (mem) {
        mem.status = 'ACCEPTED';
        mem.final_price = finalPrice;
        mem.last_modified_date = now;
        saveMemoryDbSnapshot();
      }
    }

    const otherUserId = userId === n.farmerId ? n.buyerId : n.farmerId;
    notificationService.createNotification(
      otherUserId,
      'NEGOTIATION',
      'Bargain Finalized & Accepted! 🤝',
      `Price locked at ₹${finalPrice} for ${n.produceName}! 1-Click Checkout is ready.`,
      '/dashboard/negotiations',
      { negotiationId, produceName: n.produceName, finalPrice }
    ).catch(() => {});

    return this.getNegotiationById(negotiationId);
  }

  async rejectOffer(userId: string, negotiationId: string, notes?: string): Promise<NegotiationDto> {
    const n = await this.getNegotiationById(negotiationId);
    if (n.buyerId !== userId && n.farmerId !== userId) {
      throw new BusinessException('ACCESS_DENIED', 'Not authorized to reject this negotiation');
    }

    const now = new Date();
    if (isPostgres()) {
      await db.query(
        `UPDATE negotiations
         SET status = 'REJECTED', last_modified_date = $1
         WHERE id = $2`,
        [now, negotiationId]
      );
    } else {
      const mem = memoryDb.negotiations.find((neg) => neg.id === negotiationId);
      if (mem) {
        mem.status = 'REJECTED';
        mem.last_modified_date = now;
        saveMemoryDbSnapshot();
      }
    }

    const otherUserId = userId === n.farmerId ? n.buyerId : n.farmerId;
    notificationService.createNotification(
      otherUserId,
      'NEGOTIATION',
      'Offer Declined',
      `Negotiation for ${n.produceName} was declined.`,
      '/dashboard/negotiations',
      { negotiationId, produceName: n.produceName }
    ).catch(() => {});

    return this.getNegotiationById(negotiationId);
  }

  private mapDbNegotiation(row: any): NegotiationDto {
    return {
      id: row.id,
      produceId: row.produce_id,
      produceName: row.produce_name || 'Produce',
      producePrice: row.produce_price ? parseFloat(row.produce_price) : undefined,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name || 'Buyer',
      buyerEmail: row.buyer_email,
      buyerPhone: row.buyer_phone || '9876543210',
      farmerId: row.farmer_id,
      farmerName: row.farmer_name || 'Farmer',
      farmerPhone: row.farmer_phone || '9845012345',
      quantity: parseFloat(row.quantity),
      unit: row.unit || 'KG',
      proposedPrice: parseFloat(row.proposed_price),
      counterPrice: row.counter_price ? parseFloat(row.counter_price) : null,
      finalPrice: row.final_price ? parseFloat(row.final_price) : null,
      status: row.status,
      buyerNotes: row.buyer_notes,
      farmerNotes: row.farmer_notes,
      createdDate: row.created_date,
      lastModifiedDate: row.last_modified_date,
    };
  }

  private mapMemoryNegotiation(n: any): NegotiationDto {
    const prod = memoryDb.products.find((p) => p.id === n.produce_id);
    const buyer = memoryDb.users.find((u) => u.id === n.buyer_id);
    const farmer = memoryDb.users.find((u) => u.id === n.farmer_id);

    return {
      id: n.id,
      produceId: n.produce_id,
      produceName: prod?.name || 'Produce',
      producePrice: prod?.price_per_unit,
      buyerId: n.buyer_id,
      buyerName: buyer?.full_name || 'Buyer',
      buyerEmail: buyer?.email,
      buyerPhone: buyer?.phone_number || '9876543210',
      farmerId: n.farmer_id,
      farmerName: farmer?.full_name || 'Farmer',
      farmerPhone: farmer?.phone_number || '9845012345',
      quantity: n.quantity,
      unit: n.unit,
      proposedPrice: n.proposed_price,
      counterPrice: n.counter_price,
      finalPrice: n.final_price,
      status: n.status,
      buyerNotes: n.buyer_notes,
      farmerNotes: n.farmer_notes,
      createdDate: n.created_date,
      lastModifiedDate: n.last_modified_date,
    };
  }
}

export const negotiationService = new NegotiationService();
