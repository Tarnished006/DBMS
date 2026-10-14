import { Router, Request, Response, NextFunction } from 'express';
import { marketplaceSyncService } from '../services/marketplaceSync.service.js';

const router = Router();

/**
 * GET /api/v1/marketplace/status
 * Returns current ONDC Beckn Gateway, Agmarknet indexing, and feed sync status.
 */
router.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await marketplaceSyncService.getIntegrationStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/marketplace/sync-mandi
 * Triggers on-demand real-time synchronization between live Mandi wholesale prices and marketplace produce.
 */
router.post('/sync-mandi', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await marketplaceSyncService.syncHarvestedWithLiveMandi();
    res.json({
      success: true,
      message: `Mandi price synchronization completed: ${result.updatedCount} products updated to current APMC rates.`,
      result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/marketplace/ingest-feed
 * Automated supplier catalog ingestion endpoint for FPOs and input distributors.
 */
router.post('/ingest-feed', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    const result = await marketplaceSyncService.ingestExternalSupplierFeed(items);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
