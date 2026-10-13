import { Request, Response, NextFunction } from 'express';
import { marketPriceService } from '../services/marketPrice.service.js';

export class MarketPriceController {
  async getLatestPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { commodityId, marketId, commodity, state, district, market, date } =
        req.query as any;

      const result = await marketPriceService.getLatestPrices({
        commodityId,
        marketId,
        commodity,
        state,
        district,
        market,
        date,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        commodityId,
        commodity,
        startDate,
        endDate,
        fromDate,
        toDate,
        state,
        district,
        market,
      } = req.query as any;

      const result = await marketPriceService.getPriceHistory({
        commodityId,
        commodity,
        startDate: startDate || fromDate,
        endDate: endDate || toDate,
        fromDate: fromDate || startDate,
        toDate: toDate || endDate,
        state,
        district,
        market,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const marketPriceController = new MarketPriceController();
