import { Router, Request, Response, NextFunction } from 'express';
import { producePoolService } from '../services/producePool.service.js';

const router = Router();

// Get consolidated village produce lots with freight savings
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { talukId, districtId, crop } = req.query as Record<string, string>;
    const pools = await producePoolService.getConsolidatedPools({ talukId, districtId, crop });
    res.json(pools);
  } catch (err) {
    next(err);
  }
});

export default router;
