import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';

export class AdminService {
  async getDashboard() {
    let totalUsers = 0;
    let activeProducts = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    if (isPostgres()) {
      const uRes = await db.query('SELECT COUNT(*) FROM users');
      totalUsers = parseInt(uRes.rows[0].count, 10);

      const pRes = await db.query("SELECT COUNT(*) FROM products WHERE status = 'ACTIVE'");
      activeProducts = parseInt(pRes.rows[0].count, 10);

      const oRes = await db.query('SELECT COUNT(*) FROM orders');
      totalOrders = parseInt(oRes.rows[0].count, 10);

      const revRes = await db.query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'SUCCESS'");
      totalRevenue = parseFloat(revRes.rows[0].coalesce);
    } else {
      totalUsers = memoryDb.users.length;
      activeProducts = memoryDb.products.filter((p) => p.status === 'ACTIVE').length;
      totalOrders = memoryDb.orders.length;
      totalRevenue = memoryDb.payments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + p.amount, 0);
    }

    return {
      totalUsers,
      activeProducts,
      totalOrders,
      totalRevenue,
      status: 'HEALTHY',
    };
  }

  async getAllUsers() {
    if (isPostgres()) {
      const res = await db.query(
        `SELECT u.id, u.email, u.full_name, u.phone_number, u.profile_picture_url,
                u.is_active, u.is_email_verified, u.is_phone_verified, u.is_account_non_locked,
                u.created_date, u.last_modified_date,
                COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r ON r.id = ur.role_id
         GROUP BY u.id
         ORDER BY u.created_date DESC`
      );
      return res.rows;
    }

    return memoryDb.users.map((u) => {
      const roleIds = memoryDb.user_roles.filter((ur) => ur.user_id === u.id).map((ur) => ur.role_id);
      const roles = memoryDb.roles.filter((r) => roleIds.includes(r.id)).map((r) => r.name);
      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone_number: u.phone_number,
        profile_picture_url: u.profile_picture_url,
        is_active: u.is_active,
        is_email_verified: u.is_email_verified,
        is_phone_verified: u.is_phone_verified,
        is_account_non_locked: u.is_account_non_locked,
        created_date: u.created_date,
        last_modified_date: u.last_modified_date,
        roles,
      };
    });
  }

  async getUserById(userId: string) {
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (res.rows.length === 0) throw new BusinessException('ADMIN_USER_NOT_FOUND');
      return res.rows[0];
    }
    const u = memoryDb.users.find((user) => user.id === userId);
    if (!u) throw new BusinessException('ADMIN_USER_NOT_FOUND');
    return u;
  }

  async activateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user.is_active) {
      throw new BusinessException('ADMIN_USER_ALREADY_ACTIVE');
    }

    if (isPostgres()) {
      await db.query('UPDATE users SET is_active = true, last_modified_date = $1 WHERE id = $2', [
        new Date(),
        userId,
      ]);
    } else {
      user.is_active = true;
      user.last_modified_date = new Date();
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user.is_active) {
      throw new BusinessException('ADMIN_USER_ALREADY_INACTIVE');
    }

    if (isPostgres()) {
      await db.query('UPDATE users SET is_active = false, last_modified_date = $1 WHERE id = $2', [
        new Date(),
        userId,
      ]);
    } else {
      user.is_active = false;
      user.last_modified_date = new Date();
    }
  }

  async lockUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user.is_account_non_locked) {
      throw new BusinessException('ADMIN_USER_ALREADY_LOCKED');
    }

    if (isPostgres()) {
      await db.query('UPDATE users SET is_account_non_locked = false, last_modified_date = $1 WHERE id = $2', [
        new Date(),
        userId,
      ]);
    } else {
      user.is_account_non_locked = false;
      user.last_modified_date = new Date();
    }
  }

  async unlockUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user.is_account_non_locked && !user.temporary_locked_until) {
      throw new BusinessException('ADMIN_USER_ALREADY_UNLOCKED');
    }

    if (isPostgres()) {
      await db.query(
        `UPDATE users
         SET is_account_non_locked = true, failed_login_attempts = 0, temporary_locked_until = NULL, last_modified_date = $1
         WHERE id = $2`,
        [new Date(), userId]
      );
    } else {
      user.is_account_non_locked = true;
      user.failed_login_attempts = 0;
      user.temporary_locked_until = null;
      user.last_modified_date = new Date();
    }
  }
}

export const adminService = new AdminService();
