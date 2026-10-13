import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { BusinessException } from '../errors/BusinessException.js';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { UserEntity } from '../types/index.js';

export interface AuthenticatedRequest extends Request<any> {
  user?: UserEntity & { roles: string[] };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookie
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    // 2. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      throw new BusinessException('USER_NOT_FOUND', 'Authentication token required');
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      throw new BusinessException('BAD_CREDENTIALS', 'Invalid or expired session');
    }

    let user: any = null;
    let roles: string[] = [];

    if (isPostgres()) {
      const userRes = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [payload.sub]
      );
      if (userRes.rows.length === 0) {
        throw new BusinessException('USER_NOT_FOUND', 'User does not exist');
      }
      user = userRes.rows[0];

      const rolesRes = await db.query(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [payload.sub]
      );
      roles = rolesRes.rows.map((r: { name: string }) => r.name);
    } else {
      user = memoryDb.users.find((u) => u.id === payload.sub || u.email === payload.email);
      if (!user) {
        throw new BusinessException('USER_NOT_FOUND', 'User does not exist');
      }
      const userRoleIds = memoryDb.user_roles
        .filter((ur) => ur.user_id === user.id)
        .map((ur) => ur.role_id);
      roles = memoryDb.roles
        .filter((r) => userRoleIds.includes(r.id))
        .map((r) => r.name);
    }

    // Account status checks
    if (!user.is_active) {
      throw new BusinessException('ERR_USER_DISABLED', 'Your account is disabled');
    }

    if (!user.is_account_non_locked) {
      throw new BusinessException('PERMANENT_ACCOUNT_LOCKED', 'Your account is permanently locked');
    }

    if (user.temporary_locked_until && new Date(user.temporary_locked_until) > new Date()) {
      throw new BusinessException('ACCOUNT_LOCKED', 'Your account is temporarily locked due to too many failed login attempts');
    }

    req.user = {
      ...user,
      roles,
    };

    next();
  } catch (err) {
    next(err);
  }
}
