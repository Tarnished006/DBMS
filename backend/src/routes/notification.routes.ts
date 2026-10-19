import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { notificationService } from '../services/notification.service.js';

const router = Router();

// Secure all notification endpoints with authMiddleware
router.use(authMiddleware as any);

/**
 * GET /api/v1/notifications
 * Returns authenticated user's notification list
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

/**
 * PUT /api/v1/notifications/:id/read
 * Marks a specific notification as read
 */
router.put('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const id = req.params.id;
    if (typeof id === 'string') {
      await notificationService.markAsRead(userId, id);
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark notification as read' });
  }
});

/**
 * PUT /api/v1/notifications/read-all
 * Marks all notifications for current user as read
 */
router.put('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark all notifications as read' });
  }
});

/**
 * DELETE /api/v1/notifications
 * Clears all notifications for the authenticated user
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await notificationService.clearAll(userId);
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear notifications' });
  }
});

/**
 * DELETE /api/v1/notifications/:id
 * Deletes a single notification
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const id = req.params.id;
    if (typeof id === 'string') {
      await notificationService.deleteNotification(userId, id);
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete notification' });
  }
});

export default router;
