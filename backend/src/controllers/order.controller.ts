import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { orderService } from '../services/order.service.js';

export class OrderController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.user!.id, req.body);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getUserOrders(req.user!.id);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.orderId, req.user!.id);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async getOrderAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const address = await orderService.getOrderAddress(req.params.orderId);
      res.json(address);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.body.status;
      const order = await orderService.updateOrderStatus(req.params.orderId, status, false);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.cancelOrder(req.params.orderId, req.user!.id);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async trackOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tracking = await orderService.getOrderTracking(req.params.orderId, req.user!.id);
      res.json(tracking);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
