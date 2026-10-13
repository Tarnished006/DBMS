import { Router } from 'express';
import { weatherController } from '../controllers/weather.controller.js';

const router = Router();

router.get('/daily', (req, res, next) => weatherController.getDaily(req, res, next));
router.get('/hourly', (req, res, next) => weatherController.getHourly(req, res, next));
router.get('/risk/daily', (req, res, next) => weatherController.getRiskDaily(req, res, next));
router.get('/risk/weekly', (req, res, next) => weatherController.getRiskWeekly(req, res, next));

export default router;
