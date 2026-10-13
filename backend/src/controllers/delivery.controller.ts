import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { deliveryService } from '../services/delivery.service.js';

export class DeliveryController {
  async getDeliveryByOrderId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.getDeliveryByOrderId(req.params.orderId);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }

  async generateDeliveryOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.body.orderId;
      const result = await deliveryService.generateDeliveryOtp(orderId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyDeliveryOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, otp } = req.body;
      const delivery = await deliveryService.verifyDeliveryOtp(orderId, otp);
      res.json(delivery);
    } catch (err) {
      next(err);
    }
  }
}

export const deliveryController = new DeliveryController();
