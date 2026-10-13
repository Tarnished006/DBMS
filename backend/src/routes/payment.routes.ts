import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/orders/:orderId', (req, res, next) =>
  paymentController.processPayment(req, res, next)
);
router.get('/orders/:orderId', (req, res, next) =>
  paymentController.getPaymentByOrderId(req, res, next)
);
router.post('/orders/:orderId/refund', (req, res, next) =>
  paymentController.refundPayment(req, res, next)
);

export default router;
