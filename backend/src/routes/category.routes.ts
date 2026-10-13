import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';

const router = Router();

router.get('/', (req, res, next) => categoryController.getCategories(req, res, next));
router.get('/:categoryId', (req, res, next) => categoryController.getCategoryById(req, res, next));

export default router;
