import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { OrderCreateSchema } from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => orderController.getMyOrders(req, res, next));
router.post('/', validateBody(OrderCreateSchema), (req, res, next) =>
  orderController.createOrder(req, res, next)
);
router.get('/:orderId', (req, res, next) => orderController.getOrderById(req, res, next));
router.get('/:orderId/address', (req, res, next) => orderController.getOrderAddress(req, res, next));
router.patch('/:orderId/status', (req, res, next) => orderController.updateStatus(req, res, next));
router.post('/:orderId/cancel', (req, res, next) => orderController.cancelOrder(req, res, next));
router.get('/:orderId/track', (req, res, next) => orderController.trackOrder(req, res, next));

export default router;
