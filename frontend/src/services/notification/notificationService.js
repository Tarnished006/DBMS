import apiClient from '../api/apiClient';

export const notificationService = {
  // Fetch list of notifications for the authenticated user
  async getNotifications() {
    try {
      const res = await apiClient.get('/api/v1/notifications');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  // Mark a single notification as read
  async markAsRead(id) {
    if (!id) return;
    try {
      const res = await apiClient.put(`/api/v1/notifications/${id}/read`);
      return res.data;
    } catch {
      return null;
    }
  },

  // Mark all notifications for the authenticated user as read
  async markAllAsRead() {
    try {
      const res = await apiClient.put('/api/v1/notifications/read-all');
      return res.data;
    } catch {
      return null;
    }
  },

  // Clear all notifications for the authenticated user
  async clearAll() {
    try {
      const res = await apiClient.delete('/api/v1/notifications');
      return res.data;
    } catch {
      return null;
    }
  },

  // Delete a single notification
  async deleteNotification(id) {
    if (!id) return;
    try {
      const res = await apiClient.delete(`/api/v1/notifications/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
};
