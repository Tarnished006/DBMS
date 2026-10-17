import { Router } from 'express';
import { cropInfoController } from '../controllers/cropInfo.controller.js';

const router = Router();

router.get('/categories', (req, res, next) => cropInfoController.getCategories(req, res, next));
router.get('/search', (req, res, next) => cropInfoController.searchCrops(req, res, next));
router.get('/', (req, res, next) => cropInfoController.getAllCrops(req, res, next));
router.get('/:cropId', (req, res, next) => cropInfoController.getCropById(req, res, next));

export default router;
