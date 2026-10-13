import { orderService } from './order.service.js';
import { addressService } from './address.service.js';

export class UserDashboardService {
  async getUserDashboard(userId: string) {
    const orders = await orderService.getUserOrders(userId);
    const addresses = await addressService.getUserAddresses(userId);

    const activeOrders = orders.filter(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    );
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      activeOrdersCount: activeOrders.length,
      completedOrdersCount: completedOrders.length,
      totalOrdersCount: orders.length,
      totalSpent,
      addressesCount: addresses.length,
      recentOrders: orders.slice(0, 5),
    };
  }
}

export const userDashboardService = new UserDashboardService();
