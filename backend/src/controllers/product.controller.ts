import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { productService } from '../services/product.service.js';

export class ProductController {
  async getProducts(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const result = await productService.getAllProducts(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.productId);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async getMyProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.getMyProducts(req.user!.id, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.user!.id, req.body);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProduct(req.user!.id, req.params.productId, req.body);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct(req.user!.id, req.params.productId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async getProductLocation(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const location = await productService.getProductLocation(req.params.productId);
      res.json(location);
    } catch (err) {
      next(err);
    }
  }

  async searchProducts(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const result = await productService.getAllProducts(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async searchMyProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.getMyProducts(req.user!.id, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
