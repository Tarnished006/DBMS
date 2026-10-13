import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { demandService } from '../services/demand.service.js';

const router = Router();

// Create a new buyer produce demand
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await demandService.createDemand((req as any).user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// List all open buyer demands (Public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { crop, state, grade } = req.query as Record<string, string>;
    const list = await demandService.getOpenDemands({ crop, state, grade });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Demands posted by the current logged-in buyer
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await demandService.getMyDemands((req as any).user.id);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Demand details by ID (with bids if buyer)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const demand = await demandService.getDemandById(id);
    res.json(demand);
  } catch (err) {
    next(err);
  }
});

// Farmer places bid on demand
router.post('/:id/bids', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const bid = await demandService.placeBid((req as any).user.id, id, req.body);
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
});

// Buyer accepts farmer's bid
router.post('/:id/bids/:bidId/accept', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const bidId = req.params.bidId as string;
    await demandService.acceptBid((req as any).user.id, id, bidId);
    res.json({ message: 'Bid accepted successfully. Demand marked as fulfilled.' });
  } catch (err) {
    next(err);
  }
});

export default router;
