import { Router } from 'express';
import { marketPriceController } from '../controllers/marketPrice.controller.js';

const router = Router();

router.get('/history', (req, res, next) => marketPriceController.getPriceHistory(req, res, next));
router.get('/', (req, res, next) => marketPriceController.getLatestPrices(req, res, next));

export default router;
