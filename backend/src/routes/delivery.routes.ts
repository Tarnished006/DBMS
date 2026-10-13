import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/orders/:orderId', (req, res, next) =>
  deliveryController.getDeliveryByOrderId(req, res, next)
);
router.post('/otp', (req, res, next) =>
  deliveryController.generateDeliveryOtp(req, res, next)
);
router.post('/otp/verify', (req, res, next) =>
  deliveryController.verifyDeliveryOtp(req, res, next)
);

export default router;
