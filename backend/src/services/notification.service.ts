import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb, saveMemoryDbSnapshot } from '../db/memoryStore.js';
import { NotificationDto } from '../types/index.js';

export class NotificationService {
  async getUserNotifications(userId: string): Promise<NotificationDto[]> {
    if (!userId) return [];

    // Ensure demo accounts have initial notifications if list is empty
    this.ensureDemoNotifications(userId);

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

  private ensureDemoNotifications(userId: string): void {
    const existing = memoryDb.notifications.filter((n) => n.userId === userId);
    if (existing.length > 0) return;

    const farmerId = '11111111-2222-3333-4444-555555555555';
    const buyerId = '22222222-3333-4444-5555-666666666666';

    const now = Date.now();
    const min = 60 * 1000;
    const hour = 60 * min;

    if (userId === farmerId) {
      memoryDb.notifications.push(
        {
          id: uuidv4(),
          userId: farmerId,
          type: 'NEGOTIATION',
          title: 'Counter-Offer Awaiting Approval 🤝',
          message: 'Ananya Sharma (Wholesale Buyer) offered ₹28/KG on Kolar Salad Tomatoes (500 KG). You countered ₹30/KG.',
          link: '/dashboard/negotiations',
          isRead: false,
          metadata: { negotiationId: 'neg-seed-kolar-tomatoes', produceName: 'Kolar Salad Tomatoes', counterPrice: 30 },
          createdDate: new Date(now - 15 * min),
        },
        {
          id: uuidv4(),
          userId: farmerId,
          type: 'NEGOTIATION',
          title: 'Wholesale Offer Accepted! 🤝',
          message: 'You accepted Ananya Sharma’s offer of ₹22/KG on 1,000 KG Nashik Red Onions! Ready for dispatch.',
          link: '/dashboard/negotiations',
          isRead: false,
          metadata: { negotiationId: 'neg-seed-red-onions', produceName: 'Nashik Red Onions', agreedPrice: 22 },
          createdDate: new Date(now - 50 * min),
        },
        {
          id: uuidv4(),
          userId: farmerId,
          type: 'ORDER',
          title: 'Wholesale Order Placed 📦',
          message: 'Order #AGR-88301 placed for 300 KG Nashik Red Onions. Awaiting your dispatch confirmation.',
          link: '/orders',
          isRead: false,
          metadata: { orderId: 'order-seed-88301', orderNumber: 'AGR-88301' },
          createdDate: new Date(now - 3 * hour),
        },
        {
          id: uuidv4(),
          userId: farmerId,
          type: 'PRICE_ALERT',
          title: 'Mandi Price Movement 📈',
          message: 'Kolar APMC Mandi Tomato rates surged +12% today (₹34.50/KG). Optimal time to sell.',
          link: '/market-prices',
          isRead: true,
          metadata: { mandi: 'Kolar Mandi', commodity: 'Tomato' },
          createdDate: new Date(now - 5 * hour),
        }
      );
      saveMemoryDbSnapshot();
    } else if (userId === buyerId) {
      memoryDb.notifications.push(
        {
          id: uuidv4(),
          userId: buyerId,
          type: 'NEGOTIATION',
          title: 'Farmer Counter-Offer Received 🤝',
          message: 'Farmer Ramesh Gowda counter-offered ₹30/KG for 500 KG Kolar Salad Tomatoes. 1-Click Accept ready.',
          link: '/dashboard/negotiations',
          isRead: false,
          metadata: { negotiationId: 'neg-seed-kolar-tomatoes', produceName: 'Kolar Salad Tomatoes', counterPrice: 30 },
          createdDate: new Date(now - 15 * min),
        },
        {
          id: uuidv4(),
          userId: buyerId,
          type: 'NEGOTIATION',
          title: 'Bargain Finalized & Accepted! 🤝',
          message: 'Farmer Ramesh Gowda accepted your offer of ₹22/KG on 1,000 KG Nashik Red Onions! 1-Click Checkout ready.',
          link: '/dashboard/negotiations',
          isRead: false,
          metadata: { negotiationId: 'neg-seed-red-onions', produceName: 'Nashik Red Onions', agreedPrice: 22 },
          createdDate: new Date(now - 50 * min),
        },
        {
          id: uuidv4(),
          userId: buyerId,
          type: 'ORDER',
          title: 'Order Status Update 🚚',
          message: 'Order #AGR-88301 confirmed by grower. Certified APMC 3PL Transporter dispatched from Devanahalli.',
          link: '/orders',
          isRead: false,
          metadata: { orderId: 'order-seed-88301', orderNumber: 'AGR-88301' },
          createdDate: new Date(now - 3 * hour),
        },
        {
          id: uuidv4(),
          userId: buyerId,
          type: 'PRICE_ALERT',
          title: 'Mandi Supply Inflow 🌾',
          message: 'Fresh Grade-A Shimla Capsicum arrivals reached Bangalore Binny Mill APMC at ₹42.00/KG.',
          link: '/market-prices',
          isRead: true,
          metadata: { mandi: 'Binny Mill APMC', commodity: 'Capsicum' },
          createdDate: new Date(now - 5 * hour),
        }
      );
      saveMemoryDbSnapshot();
    }
  }
}

export const notificationService = new NotificationService();
