import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => paymentController.getTransactions(req, res, next));
router.get('/payment/:paymentId', (req, res, next) =>
  paymentController.getTransactionsByPaymentId(req, res, next)
);

export default router;
