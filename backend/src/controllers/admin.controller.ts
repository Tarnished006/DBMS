import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { productService } from '../services/product.service.js';
import { productImageService } from '../services/productImage.service.js';
import { inventoryService } from '../services/inventory.service.js';
import { orderService } from '../services/order.service.js';
import { paymentService } from '../services/payment.service.js';
import { deliveryService } from '../services/delivery.service.js';

export class AdminController {
  // Dashboard
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getDashboard();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // Users
  async getUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUserById(req.params.userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async activateUser(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await adminService.activateUser(req.params.userId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async deactivateUser(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await adminService.deactivateUser(req.params.userId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async lockUser(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await adminService.lockUser(req.params.userId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async unlockUser(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await adminService.unlockUser(req.params.userId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  // Products
  async getProducts(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const result = await productService.getAllProducts({ ...req.query, status: 'ALL' });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.productId);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async updateProductStatus(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const product = await productService.updateProduct('', req.params.productId, { status }, true);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct('', req.params.productId, true);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  // Product Images
  async uploadProductImage(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const img = await productImageService.uploadProductImage('', req.params.productId, req.file, true);
      res.status(201).json(img);
    } catch (err) {
      next(err);
    }
  }

  async getProductImages(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const images = await productImageService.getProductImages(req.params.productId);
      res.json(images);
    } catch (err) {
      next(err);
    }
  }

  async updateProductImageOrder(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const order = parseInt(req.body.displayOrder || req.body.order, 10);
      await productImageService.updateImageOrder('', req.params.productId, req.params.imageId, order, true);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async setPrimaryProductImage(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await productImageService.setPrimaryImage('', req.params.productId, req.params.imageId, true);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async deleteProductImage(req: Request<any>, res: Response, next: NextFunction) {
    try {
      await productImageService.deleteProductImage('', req.params.productId, req.params.imageId, true);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  // Inventory
  async getProductInventory(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const inv = await inventoryService.getProductInventory(req.params.productId);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  async updateProductInventory(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const qty = parseInt(req.body.quantity, 10);
      const inv = await inventoryService.updateInventory('', req.params.productId, qty, true);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  async addStock(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const amount = parseInt(req.body.amount || req.body.quantity, 10);
      const inv = await inventoryService.addStock('', req.params.productId, amount, true);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  async removeStock(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const amount = parseInt(req.body.amount || req.body.quantity, 10);
      const inv = await inventoryService.removeStock('', req.params.productId, amount, true);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  // Orders
  async getOrders(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getAllOrders(req.query);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.orderId, '', true);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.orderId, status, true);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  // Payments
  async getPayments(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getAllPayments(req.query);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getPaymentByOrderId(req.params.paymentId);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentsByStatus(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getAllPayments({ status: req.params.status });
      res.json(payments);
    } catch (err) {
      next(err);
    }
  }

  // Payment Transactions
  async getPaymentTransactions(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const list = await paymentService.getTransactions();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentTransactionsByType(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const list = await paymentService.getTransactions(undefined, req.params.transactionType);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentTransactionsByStatus(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const list = await paymentService.getTransactions(undefined, undefined, req.params.status);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentTransactionsByPaymentId(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const list = await paymentService.getTransactions(req.params.paymentId);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  // Deliveries
  async getDeliveries(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await deliveryService.getAllDeliveries();
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.deliveryId);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }

  async shipDelivery(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.shipDelivery(req.params.deliveryId, req.body);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }

  async outForDelivery(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.markOutForDelivery(req.params.deliveryId);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
