import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { BusinessException } from '../errors/BusinessException.js';

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const roles = req.user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');

  if (!isAdmin) {
    return next(
      new BusinessException(
        'ACCESS_DENIED',
        'Governance Rule: You do not have permission to execute this administrative operation.'
      )
    );
  }

  next();
}
