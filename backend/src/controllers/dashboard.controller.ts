import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { userDashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  async getUserDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await userDashboardService.getUserDashboard(req.user!.id);
      res.json(dashboard);
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
