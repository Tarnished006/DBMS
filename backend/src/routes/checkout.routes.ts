import { Router } from 'express';
import { checkoutController } from '../controllers/checkout.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { OrderCreateSchema } from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(OrderCreateSchema), (req, res, next) =>
  checkoutController.processCheckout(req, res, next)
);

export default router;
