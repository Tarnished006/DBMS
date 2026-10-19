import { orderService } from './order.service.js';
import { addressService } from './address.service.js';
import { memoryDb } from '../db/memoryStore.js';
import { db, isPostgres } from '../db/dbAdapter.js';

export class UserDashboardService {
  async getUserDashboard(userId: string) {
    // 1. Buying Metrics for this user
    const buyerOrders = await orderService.getUserOrders(userId);
    const addresses = await addressService.getUserAddresses(userId);

    const activeBuyerOrders = buyerOrders.filter(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    );
    const deliveredBuyerOrders = buyerOrders.filter((o) => o.status === 'DELIVERED');
    const pendingPaymentBuyerOrders = buyerOrders.filter(
      (o) => o.payment?.status === 'PENDING' || o.status === 'PENDING'
    );
    const totalSpent = deliveredBuyerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Selling / Farmer Metrics for this user
    let sellerProducts: any[] = [];
    if (isPostgres()) {
      try {
        const prodRes = await db.query(
          `SELECT p.*, c.name as category_name
           FROM products p
           LEFT JOIN categories c ON c.id = p.category_id
           WHERE p.farmer_id = $1 OR p.seller_id = $1
           ORDER BY p.created_date DESC`,
          [userId]
        );
        sellerProducts = prodRes.rows;
      } catch {
        sellerProducts = memoryDb.products.filter(
          (p) => (p.farmer_id === userId || p.seller_id === userId)
        );
      }
    } else {
      sellerProducts = memoryDb.products.filter(
        (p) => (p.farmer_id === userId || p.seller_id === userId)
      );
    }

    const activeProducts = sellerProducts.filter(
      (p) => !p.status || p.status === 'ACTIVE'
    );

    // Orders received on seller's products
    const sellerProductIds = new Set(sellerProducts.map((p) => p.id));
    const allOrderItems = isPostgres() ? [] : memoryDb.order_items;

    const receivedOrderIds = new Set<string>();
    let totalRevenue = 0;

    for (const item of allOrderItems) {
      if (sellerProductIds.has(item.product_id)) {
        receivedOrderIds.add(item.order_id);
        totalRevenue += (item.unit_price || 0) * (item.quantity || 1);
      }
    }

    // Inventory items for this seller
    const inventoryItems = memoryDb.inventory.filter((inv) =>
      sellerProductIds.has(inv.product_id)
    );

    // Formatted list of farmer products with location & inventory quantity
    const formattedRecentProducts = sellerProducts.slice(0, 10).map((p) => {
      const inv = memoryDb.inventory.find((i) => i.product_id === p.id);
      const loc = memoryDb.product_location_snapshots.find(
        (l) => l.id === p.product_location_snapshot_id || l.product_id === p.id
      );
      const img = memoryDb.product_images.find((im) => im.product_id === p.id);

      let locDisplay = 'Karnataka, India';
      if (loc) {
        locDisplay = [loc.village_or_town || loc.village || loc.city, loc.district, loc.state]
          .filter(Boolean)
          .join(', ');
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price ?? p.price_per_unit,
        unit: p.unit || 'KG',
        quantity: inv?.quantity ?? inv?.total_quantity ?? 100,
        status: p.status || 'ACTIVE',
        harvestStatus: p.harvestStatus || p.harvest_status || 'READY_NOW',
        expectedHarvestDate: p.expectedHarvestDate || p.expected_harvest_date || null,
        location: locDisplay,
        imageUrl:
          img?.image_url ||
          img?.imageUrl ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        createdDate: p.created_date,
      };
    });

    // Customer orders placed on this farmer's products
    const customerOrders = (isPostgres() ? [] : memoryDb.orders)
      .filter((o) => receivedOrderIds.has(o.id))
      .map((o) => {
        const items = memoryDb.order_items.filter(
          (it) => it.order_id === o.id && sellerProductIds.has(it.product_id)
        );
        const buyer = memoryDb.users.find((u) => u.id === o.user_id);
        return {
          id: o.id,
          status: o.status,
          totalAmount: o.total_amount || o.totalAmount,
          customerName: buyer?.full_name || 'Wholesale Buyer',
          items: items.map((it) => {
            const prod = sellerProducts.find((p) => p.id === it.product_id);
            return {
              productName: prod?.name || 'Farm Produce',
              quantity: it.quantity,
              unitPrice: it.unit_price,
            };
          }),
          createdDate: o.created_date,
        };
      });

    // Negotiations for Buyer and Farmer
    const buyerNegotiations = (isPostgres() ? [] : memoryDb.negotiations)
      .filter((n) => n.buyer_id === userId)
      .map((n) => {
        const prod = memoryDb.products.find((p) => p.id === n.produce_id);
        const farmer = memoryDb.users.find((u) => u.id === n.farmer_id);
        return {
          id: n.id,
          produceId: n.produce_id,
          produceName: prod?.name || 'Farm Produce',
          farmerName: farmer?.full_name || 'Farmer',
          proposedPrice: n.proposed_price,
          counterPrice: n.counter_price,
          finalPrice: n.final_price,
          quantity: n.quantity,
          unit: n.unit,
          status: n.status,
          buyerNotes: n.buyer_notes,
          farmerNotes: n.farmer_notes,
          lastModifiedDate: n.last_modified_date,
        };
      });

    const farmerNegotiations = (isPostgres() ? [] : memoryDb.negotiations)
      .filter((n) => n.farmer_id === userId)
      .map((n) => {
        const prod = memoryDb.products.find((p) => p.id === n.produce_id);
        const buyer = memoryDb.users.find((u) => u.id === n.buyer_id);
        return {
          id: n.id,
          produceId: n.produce_id,
          produceName: prod?.name || 'Farm Produce',
          buyerName: buyer?.full_name || 'Wholesale Buyer',
          proposedPrice: n.proposed_price,
          counterPrice: n.counter_price,
          finalPrice: n.final_price,
          quantity: n.quantity,
          unit: n.unit,
          status: n.status,
          buyerNotes: n.buyer_notes,
          farmerNotes: n.farmer_notes,
          lastModifiedDate: n.last_modified_date,
        };
      });

    return {
      // Legacy flat keys
      activeOrdersCount: activeBuyerOrders.length,
      completedOrdersCount: deliveredBuyerOrders.length,
      totalOrdersCount: buyerOrders.length,
      totalSpent,
      addressesCount: addresses.length,
      total_addresses: addresses.length,
      totalAddresses: addresses.length,
      recentOrders: buyerOrders.slice(0, 5),

      // Structured Buying object for Buyer Dashboard
      buying: {
        total_orders: buyerOrders.length,
        totalOrders: buyerOrders.length,
        active_orders: activeBuyerOrders.length,
        activeOrders: activeBuyerOrders.length,
        delivered_orders: deliveredBuyerOrders.length,
        deliveredOrders: deliveredBuyerOrders.length,
        pending_payment_orders: pendingPaymentBuyerOrders.length,
        pendingPaymentOrders: pendingPaymentBuyerOrders.length,
        total_spent: totalSpent,
        totalSpent,
        recent_orders: buyerOrders.slice(0, 5),
        active_negotiations: buyerNegotiations.length,
        activeNegotiations: buyerNegotiations.length,
        recent_negotiations: buyerNegotiations.slice(0, 5),
      },

      // Structured Selling object for Farmer Dashboard
      selling: {
        total_products: sellerProducts.length,
        totalProducts: sellerProducts.length,
        active_products: activeProducts.length,
        activeProducts: activeProducts.length,
        total_product_orders: receivedOrderIds.size,
        totalProductOrders: receivedOrderIds.size,
        inventory_items: inventoryItems.length || sellerProducts.length,
        inventoryItems: inventoryItems.length || sellerProducts.length,
        total_revenue: totalRevenue,
        totalRevenue,
        recent_products: formattedRecentProducts,
        recentProducts: formattedRecentProducts,
        customer_orders: customerOrders.slice(0, 5),
        customerOrders: customerOrders.slice(0, 5),
        incoming_negotiations: farmerNegotiations.length,
        incomingNegotiations: farmerNegotiations.length,
        recent_negotiations: farmerNegotiations.slice(0, 5),
      },
    };
  }
}

export const userDashboardService = new UserDashboardService();
