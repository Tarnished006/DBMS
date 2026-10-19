import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { negotiationService } from '../services/negotiation.service.js';

const router = Router();

// Propose a price/quantity offer
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await negotiationService.createOffer((req as any).user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Incoming offers for farmer
router.get('/farmer', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await negotiationService.getMyFarmerNegotiations((req as any).user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Outgoing offers from buyer
router.get('/buyer', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await negotiationService.getMyBuyerNegotiations((req as any).user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get negotiation details
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await negotiationService.getNegotiationById(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Farmer counters with a different price
router.patch('/:id/counter', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const counterPrice = req.body.counterPrice || req.body.price;
    const notes = req.body.farmerNotes || req.body.buyerNotes || req.body.notes;
    const result = await negotiationService.counterOffer(
      (req as any).user.id,
      id,
      counterPrice,
      notes
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Either party accepts the pending/countered offer
router.patch('/:id/accept', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await negotiationService.acceptOffer((req as any).user.id, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Reject offer
router.patch('/:id/reject', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await negotiationService.rejectOffer(
      (req as any).user.id,
      id,
      req.body.notes
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
