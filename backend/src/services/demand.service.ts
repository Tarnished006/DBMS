import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { BuyerDemandDto, DemandBidDto, QualityGrade } from '../types/index.js';
import { notificationService } from './notification.service.js';

export class DemandService {
  async createDemand(
    buyerId: string,
    data: {
      cropName: string;
      categoryId?: string;
      quantityNeeded: number;
      unit?: string;
      targetPricePerUnit: number;
      qualityGrade?: QualityGrade;
      requiredByDate: string;
      deliveryTalukId?: string;
      deliveryCity?: string;
      deliveryState?: string;
      description?: string;
    }
  ): Promise<BuyerDemandDto> {
    if (!data.cropName || !data.quantityNeeded || !data.targetPricePerUnit || !data.requiredByDate) {
      throw new BusinessException('INVALID_REQUEST', 'Crop name, quantity, target price, and required date are required');
    }

    if (data.quantityNeeded <= 0 || data.targetPricePerUnit <= 0) {
      throw new BusinessException('INVALID_REQUEST', 'Quantity and price must be greater than zero');
    }

    const id = uuidv4();
    const now = new Date();
    const unit = data.unit || 'KG';
    const qualityGrade = data.qualityGrade || 'GRADE_A';
    const deliveryState = data.deliveryState || 'Karnataka';

    if (isPostgres()) {
      await db.query(
        `INSERT INTO buyer_demands (
          id, buyer_id, crop_name, category_id, quantity_needed, unit,
          target_price_per_unit, quality_grade, required_by_date,
          delivery_taluk_id, delivery_city, delivery_state, description,
          status, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'OPEN', $14, $14)`,
        [
          id,
          buyerId,
          data.cropName.trim(),
          data.categoryId || null,
          data.quantityNeeded,
          unit,
          data.targetPricePerUnit,
          qualityGrade,
          data.requiredByDate,
          data.deliveryTalukId || null,
          data.deliveryCity?.trim() || null,
          deliveryState,
          data.description?.trim() || null,
          now,
        ]
      );
    } else {
      memoryDb.buyer_demands.push({
        id,
        buyer_id: buyerId,
        crop_name: data.cropName.trim(),
        category_id: data.categoryId || null,
        quantity_needed: data.quantityNeeded,
        unit,
        target_price_per_unit: data.targetPricePerUnit,
        quality_grade: qualityGrade,
        required_by_date: data.requiredByDate,
        delivery_taluk_id: data.deliveryTalukId || null,
        delivery_city: data.deliveryCity?.trim() || null,
        delivery_state: deliveryState,
        description: data.description?.trim() || null,
        status: 'OPEN',
        created_date: now,
        last_modified_date: now,
      });
    }

    return this.getDemandById(id);
  }

  async getOpenDemands(filters?: { crop?: string; state?: string; grade?: string }): Promise<BuyerDemandDto[]> {
    if (isPostgres()) {
      let query = `
        SELECT d.*, u.full_name as buyer_name,
               (SELECT COUNT(*) FROM demand_bids b WHERE b.demand_id = d.id)::int as bids_count
        FROM buyer_demands d
        JOIN users u ON u.id = d.buyer_id
        WHERE d.status = 'OPEN'
      `;
      const params: any[] = [];
      let idx = 1;

      if (filters?.crop) {
        query += ` AND LOWER(d.crop_name) LIKE $${idx++}`;
        params.push(`%${filters.crop.toLowerCase().trim()}%`);
      }
      if (filters?.state) {
        query += ` AND LOWER(d.delivery_state) = $${idx++}`;
        params.push(filters.state.toLowerCase().trim());
      }
      if (filters?.grade) {
        query += ` AND d.quality_grade = $${idx++}`;
        params.push(filters.grade.toUpperCase());
      }

      query += ' ORDER BY d.created_date DESC LIMIT 50';
      const res = await db.query(query, params);
      return res.rows.map(this.mapDbDemand);
    }

    let list = memoryDb.buyer_demands.filter((d) => d.status === 'OPEN');
    if (filters?.crop) {
      list = list.filter((d) => d.crop_name.toLowerCase().includes(filters.crop!.toLowerCase().trim()));
    }
    if (filters?.grade) {
      list = list.filter((d) => d.quality_grade === filters.grade!.toUpperCase());
    }
    return list.map(this.mapMemoryDemand);
  }

  async getMyDemands(buyerId: string): Promise<BuyerDemandDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT d.*, u.full_name as buyer_name,
                (SELECT COUNT(*) FROM demand_bids b WHERE b.demand_id = d.id)::int as bids_count
         FROM buyer_demands d
         JOIN users u ON u.id = d.buyer_id
         WHERE d.buyer_id = $1
         ORDER BY d.created_date DESC`,
        [buyerId]
      );
      return res.rows.map(this.mapDbDemand);
    }

    const list = memoryDb.buyer_demands.filter((d) => d.buyer_id === buyerId);
    return list.map(this.mapMemoryDemand);
  }

  async getDemandById(id: string): Promise<BuyerDemandDto & { bids?: DemandBidDto[] }> {
    let demand: BuyerDemandDto;
    if (isPostgres()) {
      const res = await db.query(
        `SELECT d.*, u.full_name as buyer_name,
                (SELECT COUNT(*) FROM demand_bids b WHERE b.demand_id = d.id)::int as bids_count
         FROM buyer_demands d
         JOIN users u ON u.id = d.buyer_id
         WHERE d.id = $1`,
        [id]
      );
      if (res.rows.length === 0) {
        throw new BusinessException('RESOURCE_NOT_FOUND', 'Buyer requirement not found');
      }
      demand = this.mapDbDemand(res.rows[0]);
    } else {
      const d = memoryDb.buyer_demands.find((item) => item.id === id);
      if (!d) {
        throw new BusinessException('RESOURCE_NOT_FOUND', 'Buyer requirement not found');
      }
      demand = this.mapMemoryDemand(d);
    }

    const bids = await this.getBidsForDemand(id);
    return { ...demand, bids };
  }

  async placeBid(
    farmerId: string,
    demandId: string,
    data: { offeredQuantity: number; offeredPricePerUnit: number; notes?: string }
  ): Promise<DemandBidDto> {
    const demand = await this.getDemandById(demandId);
    if (demand.buyerId === farmerId) {
      throw new BusinessException('ACCESS_DENIED', 'You posted this requirement as a buyer; only registered farmers can fulfill or supply produce for it.');
    }
    if (demand.status !== 'OPEN') {
      throw new BusinessException('INVALID_REQUEST', 'This requirement is no longer accepting bids');
    }

    const id = uuidv4();
    const now = new Date();

    if (isPostgres()) {
      await db.query(
        `INSERT INTO demand_bids (id, demand_id, farmer_id, offered_quantity, offered_price_per_unit, notes, status, created_date)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)`,
        [id, demandId, farmerId, data.offeredQuantity, data.offeredPricePerUnit, data.notes?.trim() || null, now]
      );
    } else {
      memoryDb.demand_bids.push({
        id,
        demand_id: demandId,
        farmer_id: farmerId,
        offered_quantity: data.offeredQuantity,
        offered_price_per_unit: data.offeredPricePerUnit,
        notes: data.notes?.trim() || null,
        status: 'PENDING',
        created_date: now,
      });
    }

    // Notify the buyer who posted the requirement
    try {
      const farmer = isPostgres()
        ? (await db.query('SELECT full_name FROM users WHERE id = $1', [farmerId])).rows[0]
        : memoryDb.users.find((u) => u.id === farmerId);
      const farmerName = farmer?.full_name || 'A local verified farmer';
      await notificationService.createNotification(
        demand.buyerId,
        'ORDER',
        'New Produce Supply Bid Received 🌾',
        `${farmerName} has offered to supply ${data.offeredQuantity} ${demand.unit} of ${demand.cropName} at ₹${data.offeredPricePerUnit}/${demand.unit}.`,
        `/demands?id=${demandId}`,
        { demandId, bidId: id, farmerId }
      );
    } catch {}

    return {
      id,
      demandId,
      farmerId,
      offeredQuantity: data.offeredQuantity,
      offeredPricePerUnit: data.offeredPricePerUnit,
      notes: data.notes,
      status: 'PENDING',
      createdDate: now,
    };
  }

  async acceptBid(buyerId: string, demandId: string, bidId: string): Promise<void> {
    const demand = await this.getDemandById(demandId);
    if (demand.buyerId !== buyerId) {
      throw new BusinessException('ACCESS_DENIED', 'Only the buyer who posted the requirement can accept a bid');
    }

    if (isPostgres()) {
      await db.query(`UPDATE demand_bids SET status = 'ACCEPTED' WHERE id = $1`, [bidId]);
      await db.query(`UPDATE buyer_demands SET status = 'FULFILLED', last_modified_date = $1 WHERE id = $2`, [
        new Date(),
        demandId,
      ]);
    } else {
      const bid = memoryDb.demand_bids.find((b) => b.id === bidId);
      if (bid) bid.status = 'ACCEPTED';
      const d = memoryDb.buyer_demands.find((b) => b.id === demandId);
      if (d) d.status = 'FULFILLED';
    }

    // Notify the winning farmer that their supply bid was accepted
    try {
      const buyer = isPostgres()
        ? (await db.query('SELECT full_name FROM users WHERE id = $1', [buyerId])).rows[0]
        : memoryDb.users.find((u) => u.id === buyerId);
      const buyerName = buyer?.full_name || 'Wholesale Buyer';
      const bids = await this.getBidsForDemand(demandId);
      const winningBid = bids.find((b) => b.id === bidId);
      if (winningBid) {
        await notificationService.createNotification(
          winningBid.farmerId,
          'ORDER',
          'Supply Bid Accepted & Confirmed! 🎉',
          `${buyerName} accepted your supply offer of ${winningBid.offeredQuantity} ${demand.unit} for ${demand.cropName} at ₹${winningBid.offeredPricePerUnit}/${demand.unit}. Trade terms locked!`,
          `/demands?id=${demandId}`,
          { demandId, bidId }
        );
      }
    } catch {}
  }

  private async getBidsForDemand(demandId: string): Promise<DemandBidDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT b.*, u.full_name as farmer_name
         FROM demand_bids b
         JOIN users u ON u.id = b.farmer_id
         WHERE b.demand_id = $1
         ORDER BY b.offered_price_per_unit ASC, b.created_date ASC`,
        [demandId]
      );
      return res.rows.map((r: any) => ({
        id: r.id,
        demandId: r.demand_id,
        farmerId: r.farmer_id,
        farmerName: r.farmer_name,
        offeredQuantity: parseFloat(r.offered_quantity),
        offeredPricePerUnit: parseFloat(r.offered_price_per_unit),
        notes: r.notes,
        status: r.status,
        createdDate: r.created_date,
      }));
    }

    const list = memoryDb.demand_bids.filter((b) => b.demand_id === demandId);
    return list.map((b) => {
      const u = memoryDb.users.find((user) => user.id === b.farmer_id);
      return {
        id: b.id,
        demandId: b.demand_id,
        farmerId: b.farmer_id,
        farmerName: u?.full_name || 'Farmer',
        offeredQuantity: b.offered_quantity,
        offeredPricePerUnit: b.offered_price_per_unit,
        notes: b.notes,
        status: b.status,
        createdDate: b.created_date,
      };
    });
  }

  private mapDbDemand(row: any): BuyerDemandDto {
    const reqDate =
      typeof row.required_by_date === 'string'
        ? row.required_by_date
        : row.required_by_date?.toISOString?.().split('T')[0] || '';
    return {
      id: row.id,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name || 'Buyer',
      cropName: row.crop_name,
      categoryId: row.category_id,
      quantityNeeded: parseFloat(row.quantity_needed),
      unit: row.unit || 'KG',
      targetPricePerUnit: parseFloat(row.target_price_per_unit),
      qualityGrade: row.quality_grade || 'GRADE_A',
      requiredByDate: reqDate,
      deliveryTalukId: row.delivery_taluk_id,
      deliveryCity: row.delivery_city,
      deliveryState: row.delivery_state,
      description: row.description,
      status: row.status,
      bidsCount: row.bids_count !== undefined ? parseInt(row.bids_count, 10) : 0,
      createdDate: row.created_date,
    };
  }

  private mapMemoryDemand(d: any): BuyerDemandDto {
    const u = memoryDb.users.find((user) => user.id === d.buyer_id);
    const bids = memoryDb.demand_bids.filter((b) => b.demand_id === d.id);
    return {
      id: d.id,
      buyerId: d.buyer_id,
      buyerName: u?.full_name || 'Buyer',
      cropName: d.crop_name,
      categoryId: d.category_id,
      quantityNeeded: d.quantity_needed,
      unit: d.unit,
      targetPricePerUnit: d.target_price_per_unit,
      qualityGrade: d.quality_grade,
      requiredByDate: d.required_by_date,
      deliveryTalukId: d.delivery_taluk_id,
      deliveryCity: d.delivery_city,
      deliveryState: d.delivery_state,
      description: d.description,
      status: d.status,
      bidsCount: bids.length,
      createdDate: d.created_date,
    };
  }
}

export const demandService = new DemandService();
