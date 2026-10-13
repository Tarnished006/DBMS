import { Request, Response, NextFunction } from 'express';
import { cropInfoService } from '../services/cropInfo.service.js';

export class CropInfoController {
  async getAllCrops(_req: Request, res: Response, next: NextFunction) {
    try {
      const crops = await cropInfoService.getAllCrops();
      res.json(crops);
    } catch (err) {
      next(err);
    }
  }

  async searchCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.query || req.query.q || '') as string;
      const crops = await cropInfoService.searchCrops(query);
      res.json(crops);
    } catch (err) {
      next(err);
    }
  }

  async getCropById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const crop = await cropInfoService.getCropById(req.params.cropId);
      res.json(crop);
    } catch (err) {
      next(err);
    }
  }
}

export const cropInfoController = new CropInfoController();
