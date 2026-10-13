import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';

export class CategoryController {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  async getCategoryById(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getCategoryById(req.params.categoryId);
      res.json(category);
    } catch (err) {
      next(err);
    }
  }
}

export const categoryController = new CategoryController();
