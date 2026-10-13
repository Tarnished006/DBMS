import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { inventoryService } from '../services/inventory.service.js';

export class InventoryController {
  async getAvailability(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const quantity = parseInt(req.query.quantity as string, 10) || 1;
      const result = await inventoryService.checkAvailability(req.params.productId, quantity);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await inventoryService.getMyInventory(req.user!.id);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async getProductInventory(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const inv = await inventoryService.getProductInventory(req.params.productId);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  async updateInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newQty = parseInt(req.body.quantity, 10);
      const inv = await inventoryService.updateInventory(req.user!.id, req.params.productId, newQty);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  async addStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const amount = parseInt(req.body.amount || req.body.quantity, 10);
      const inv = await inventoryService.addStock(req.user!.id, req.params.productId, amount);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }

  async removeStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const amount = parseInt(req.body.amount || req.body.quantity, 10);
      const inv = await inventoryService.removeStock(req.user!.id, req.params.productId, amount);
      res.json(inv);
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();
