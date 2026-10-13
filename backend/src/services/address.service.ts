import { v4 as uuidv4 } from 'uuid';
import { BusinessException } from '../errors/BusinessException.js';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { AddressDto } from '../types/index.js';

export class AddressService {
  async getUserAddresses(userId: string): Promise<AddressDto[]> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT a.id, a.address_line1, a.address_line2,
                COALESCE(a.city, a.village, '') as landmark,
                a.taluk_id, a.pincode as pin_code,
                a.latitude, a.longitude, a.is_default,
                t.name as taluk_name, d.name as district_name, s.name as state_name
         FROM addresses a
         LEFT JOIN taluks t ON t.id = a.taluk_id
         LEFT JOIN districts d ON d.id = t.district_id
         LEFT JOIN states s ON s.id = d.state_id
         WHERE a.user_id = $1
         ORDER BY a.is_default DESC, a.created_date DESC`,
        [userId]
      );
      return res.rows.map(this.mapDbAddress);
    }

    const list = memoryDb.addresses.filter((a) => a.user_id === userId);
    return list.map(this.mapMemoryAddress);
  }

  async getAddressById(userId: string, addressId: string): Promise<AddressDto> {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT a.id, a.address_line1, a.address_line2,
                COALESCE(a.city, a.village, '') as landmark,
                a.taluk_id, a.pincode as pin_code,
                a.latitude, a.longitude, a.is_default,
                t.name as taluk_name, d.name as district_name, s.name as state_name
         FROM addresses a
         LEFT JOIN taluks t ON t.id = a.taluk_id
         LEFT JOIN districts d ON d.id = t.district_id
         LEFT JOIN states s ON s.id = d.state_id
         WHERE a.id = $1 AND a.user_id = $2`,
        [addressId, userId]
      );
      if (res.rows.length === 0) throw new BusinessException('ADDRESS_NOT_FOUND');
      return this.mapDbAddress(res.rows[0]);
    }

    const addr = memoryDb.addresses.find((a) => a.id === addressId && a.user_id === userId);
    if (!addr) throw new BusinessException('ADDRESS_NOT_FOUND');
    return this.mapMemoryAddress(addr);
  }

  async createAddress(userId: string, data: any): Promise<AddressDto> {
    const isFirst = (await this.getUserAddresses(userId)).length === 0;
    const shouldBeDefault = data.isDefault || isFirst;

    if (shouldBeDefault) {
      if (isPostgres()) {
        await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      } else {
        memoryDb.addresses.filter((a) => a.user_id === userId).forEach((a) => (a.is_default = false));
      }
    }

    const id = uuidv4();
    const now = new Date();

    if (isPostgres()) {
      await db.query(
        `INSERT INTO addresses (
          id, user_id, address_line1, address_line2, city, taluk_id, pincode,
          latitude, longitude, is_default, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
        [
          id,
          userId,
          data.addressLine1.trim(),
          data.addressLine2?.trim() || null,
          data.landmark?.trim() || data.city?.trim() || null,
          data.talukId || null,
          data.pinCode?.trim() || data.pincode?.trim() || '560001',
          data.latitude || null,
          data.longitude || null,
          shouldBeDefault,
          now,
        ]
      );
      return this.getAddressById(userId, id);
    }

    const newRecord = {
      id,
      user_id: userId,
      address_line1: data.addressLine1.trim(),
      address_line2: data.addressLine2?.trim() || null,
      landmark: data.landmark?.trim() || null,
      taluk_id: data.talukId,
      pin_code: data.pinCode?.trim() || data.pincode?.trim() || '560001',
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_default: shouldBeDefault,
      created_date: now,
      last_modified_date: now,
    };
    memoryDb.addresses.push(newRecord);
    return this.mapMemoryAddress(newRecord);
  }

  async updateAddress(userId: string, addressId: string, data: any): Promise<AddressDto> {
    const existing = await this.getAddressById(userId, addressId);

    if (data.isDefault) {
      if (isPostgres()) {
        await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      } else {
        memoryDb.addresses.filter((a) => a.user_id === userId).forEach((a) => (a.is_default = false));
      }
    }

    if (isPostgres()) {
      await db.query(
        `UPDATE addresses SET
          address_line1 = COALESCE($1, address_line1),
          address_line2 = COALESCE($2, address_line2),
          city = COALESCE($3, city),
          taluk_id = COALESCE($4, taluk_id),
          pincode = COALESCE($5, pincode),
          latitude = COALESCE($6, latitude),
          longitude = COALESCE($7, longitude),
          is_default = COALESCE($8, is_default),
          last_modified_date = $9
        WHERE id = $10 AND user_id = $11`,
        [
          data.addressLine1?.trim() || null,
          data.addressLine2?.trim() || null,
          data.landmark?.trim() || data.city?.trim() || null,
          data.talukId || null,
          data.pinCode?.trim() || data.pincode?.trim() || null,
          data.latitude !== undefined ? data.latitude : null,
          data.longitude !== undefined ? data.longitude : null,
          data.isDefault !== undefined ? data.isDefault : null,
          new Date(),
          addressId,
          userId,
        ]
      );
      return this.getAddressById(userId, addressId);
    }

    const mem = memoryDb.addresses.find((a) => a.id === addressId && a.user_id === userId);
    if (!mem) throw new BusinessException('ADDRESS_NOT_FOUND');

    if (data.addressLine1 !== undefined) mem.address_line1 = data.addressLine1;
    if (data.addressLine2 !== undefined) mem.address_line2 = data.addressLine2;
    if (data.landmark !== undefined) mem.landmark = data.landmark;
    if (data.talukId !== undefined) mem.taluk_id = data.talukId;
    if (data.pinCode !== undefined) mem.pin_code = data.pinCode;
    if (data.latitude !== undefined) mem.latitude = data.latitude;
    if (data.longitude !== undefined) mem.longitude = data.longitude;
    if (data.isDefault !== undefined) mem.is_default = data.isDefault;
    mem.last_modified_date = new Date();

    return this.mapMemoryAddress(mem);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await this.updateAddress(userId, addressId, { isDefault: true });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    if (isPostgres()) {
      const res = await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId]);
      if (res.rowCount === 0) throw new BusinessException('ADDRESS_NOT_FOUND');
    } else {
      const idx = memoryDb.addresses.findIndex((a) => a.id === addressId && a.user_id === userId);
      if (idx === -1) throw new BusinessException('ADDRESS_NOT_FOUND');
      memoryDb.addresses.splice(idx, 1);
    }
  }

  private mapDbAddress(row: any): AddressDto {
    return {
      id: row.id,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      landmark: row.landmark,
      talukId: row.taluk_id,
      taluk: row.taluk_name,
      district: row.district_name,
      state: row.state_name,
      pinCode: row.pin_code,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      isDefault: !!row.is_default,
    };
  }

  private mapMemoryAddress(row: any): AddressDto {
    const taluk = memoryDb.taluks.find((t) => t.id === row.taluk_id);
    const district = taluk ? memoryDb.districts.find((d) => d.id === taluk.district_id) : null;
    const state = district ? memoryDb.states.find((s) => s.id === district.state_id) : null;

    return {
      id: row.id,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      landmark: row.landmark,
      talukId: row.taluk_id,
      taluk: taluk?.name,
      district: district?.name,
      state: state?.name,
      pinCode: row.pin_code,
      latitude: row.latitude,
      longitude: row.longitude,
      isDefault: !!row.is_default,
    };
  }
}

export const addressService = new AddressService();
