import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb, saveMemoryDbSnapshot } from '../db/memoryStore.js';
import { NotificationDto } from '../types/index.js';

export class NotificationService {
  async getUserNotifications(userId: string): Promise<NotificationDto[]> {
    if (!userId) return [];

    if (isPostgres()) {
      try {
        const res = await db.query(
          `SELECT id, user_id, type, title, message, link, is_read, metadata, created_date
           FROM notifications
           WHERE user_id = $1
           ORDER BY created_date DESC
           LIMIT 50`,
          [userId]
        );
        return res.rows.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          type: r.type,
          title: r.title,
          message: r.message,
          link: r.link,
          isRead: Boolean(r.is_read),
          metadata: r.metadata ? JSON.parse(r.metadata) : null,
          createdDate: r.created_date,
        }));
      } catch (err) {
        // Fall back to memoryDb
      }
    }

    const items = memoryDb.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    return items;
  }

  async createNotification(
    userId: string,
    type: 'NEGOTIATION' | 'ORDER' | 'LOGISTICS' | 'PRICE_ALERT' | 'SYSTEM',
    title: string,
    message: string,
    link: string = '/dashboard',
    metadata?: any
  ): Promise<NotificationDto> {
    const id = uuidv4();
    const now = new Date();

    const notif: NotificationDto = {
      id,
      userId,
      type,
      title,
      message,
      link,
      isRead: false,
      metadata: metadata || null,
      createdDate: now,
    };

    if (isPostgres()) {
      try {
        await db.query(
          `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, metadata, created_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [id, userId, type, title, message, link, false, metadata ? JSON.stringify(metadata) : null, now]
        );
      } catch {
        // Fall back to memoryDb
      }
    }

    memoryDb.notifications.unshift(notif);
    saveMemoryDbSnapshot();
    return notif;
  }

  async markAsRead(userId: string, id: string): Promise<boolean> {
    if (isPostgres()) {
      try {
        await db.query(
          `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
          [id, userId]
        );
      } catch {}
    }

    const item = memoryDb.notifications.find((n) => n.id === id && n.userId === userId);
    if (item) {
      item.isRead = true;
      saveMemoryDbSnapshot();
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    if (isPostgres()) {
      try {
        await db.query(
          `UPDATE notifications SET is_read = true WHERE user_id = $1`,
          [userId]
        );
      } catch {}
    }

    let modified = false;
    for (const item of memoryDb.notifications) {
      if (item.userId === userId && !item.isRead) {
        item.isRead = true;
        modified = true;
      }
    }
    if (modified) {
      saveMemoryDbSnapshot();
    }
    return true;
  }

  async clearAll(userId: string): Promise<boolean> {
    if (isPostgres()) {
      try {
        await db.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
      } catch {}
    }
    memoryDb.notifications = memoryDb.notifications.filter((n) => n.userId !== userId);
    saveMemoryDbSnapshot();
    return true;
  }

  async deleteNotification(userId: string, id: string): Promise<boolean> {
    if (isPostgres()) {
      try {
        await db.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
      } catch {}
    }
    memoryDb.notifications = memoryDb.notifications.filter((n) => !(n.id === id && n.userId === userId));
    saveMemoryDbSnapshot();
    return true;
  }
}

export const notificationService = new NotificationService();
