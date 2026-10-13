import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { orderService } from '../services/order.service.js';

export class CheckoutController {
  async processCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.user!.id, req.body);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
}

export const checkoutController = new CheckoutController();
