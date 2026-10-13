import { Router, Request, Response, NextFunction } from 'express';
import { weatherController } from '../controllers/weather.controller.js';

const router = Router();

router.get('/daily', (req: Request, res: Response, next: NextFunction) =>
  weatherController.getDaily(req, res, next)
);
router.get('/hourly', (req: Request, res: Response, next: NextFunction) =>
  weatherController.getHourly(req, res, next)
);
router.get('/risk/daily', (req: Request, res: Response, next: NextFunction) =>
  weatherController.getRiskDaily(req, res, next)
);
router.get('/risk/weekly', (req: Request, res: Response, next: NextFunction) =>
  weatherController.getRiskWeekly(req, res, next)
);
router.get('/search', (req: Request, res: Response, next: NextFunction) =>
  weatherController.searchLocation(req, res, next)
);

export default router;
