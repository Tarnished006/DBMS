import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { userService } from '../services/user.service.js';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getCurrentUserProfile(req.user!.id);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async updateFullName(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.updateFullName(req.user!.id, req.body.fullName);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async updateProfilePicture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.updateProfilePicture(req.user!.id, req.file);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async sendPhoneOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.sendPhoneOtp(req.user!.id, req.body.phoneNumber);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyPhoneOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.verifyPhoneOtp(req.user!.id, req.body.phoneNumber, req.body.otp);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resendPhoneOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.resendPhoneOtp(req.user!.id, req.body.phoneNumber);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async setPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.setPassword(req.user!.id, req.body.newPassword);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.user!.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
