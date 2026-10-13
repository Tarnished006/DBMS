import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';

export class PaymentController {
  async processPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const provider = req.body?.provider || 'MOCK';
      const payment = await paymentService.processPayment(req.params.orderId, provider);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentByOrderId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getPaymentByOrderId(req.params.orderId);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  }

  async refundPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.refundPayment(req.params.orderId, false);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const { paymentId, type, status } = req.query as any;
      const transactions = await paymentService.getTransactions(paymentId, type, status);
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  }

  async getTransactionsByPaymentId(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const transactions = await paymentService.getTransactions(req.params.paymentId);
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
