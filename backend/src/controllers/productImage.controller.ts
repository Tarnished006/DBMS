import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { productImageService } from '../services/productImage.service.js';

export class ProductImageController {
  async getImages(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const images = await productImageService.getProductImages(req.params.productId);
      res.json(images);
    } catch (err) {
      next(err);
    }
  }

  async uploadImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const img = await productImageService.uploadProductImage(
        req.user!.id,
        req.params.productId,
        req.file
      );
      res.status(201).json(img);
    } catch (err) {
      next(err);
    }
  }

  async updateOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = parseInt(req.body.displayOrder || req.body.order, 10);
      await productImageService.updateImageOrder(
        req.user!.id,
        req.params.productId,
        req.params.imageId,
        order
      );
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async setPrimary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await productImageService.setPrimaryImage(
        req.user!.id,
        req.params.productId,
        req.params.imageId
      );
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async deleteImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await productImageService.deleteProductImage(
        req.user!.id,
        req.params.productId,
        req.params.imageId
      );
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export const productImageController = new ProductImageController();
