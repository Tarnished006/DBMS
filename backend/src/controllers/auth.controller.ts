import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    maxAge: ENV.JWT_ACCESS_EXPIRATION_MS,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    maxAge: ENV.JWT_REFRESH_EXPIRATION_MS,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
  });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      if (result.accessToken && result.refreshToken) {
        setAuthCookies(res, result.accessToken, result.refreshToken);
      }
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const result = await authService.refreshToken(rawToken);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json(result);
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
      await authService.logout(rawToken);
      clearAuthCookies(res);
      res.status(204).end();
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await authService.logoutAll(req.user.id);
      }
      clearAuthCookies(res);
      res.status(204).end();
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      const result = await authService.verifyEmail(token);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body?.email;
      // Triggers new email verification token
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body?.email;
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async oauth2Exchange(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const result = await authService.exchangeOAuthCode(code);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
