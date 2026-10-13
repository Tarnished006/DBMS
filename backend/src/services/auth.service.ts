import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/password.js';
import { hashToken, generateSecureToken } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import { BusinessException } from '../errors/BusinessException.js';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { ENV } from '../config/env.js';

export class AuthService {
  async register(data: { fullName: string; email: string; password: string }): Promise<{ message: string }> {
    const email = data.email.toLowerCase().trim();

    if (isPostgres()) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        throw new BusinessException('EMAIL_ALREADY_EXISTS', 'The provided email address cannot be used.');
      }

      const passwordHash = await hashPassword(data.password);
      const userId = uuidv4();
      const now = new Date();

      await db.query(
        `INSERT INTO users (
          id, email, password, full_name, enabled, email_verified, phone_verified,
          credentials_expired, account_locked, failed_login_attempts, created_date, last_modified_date, password_changed_at
        ) VALUES ($1, $2, $3, $4, true, false, false, false, false, 0, $5, $5, $5)`,
        [userId, email, passwordHash, data.fullName.trim(), now]
      );

      // Assign ROLE_USER (seed role dynamically if missing)
      let roleRes = await db.query("SELECT id FROM roles WHERE name = 'ROLE_USER' OR name = 'USER'");
      let roleId = roleRes.rows[0]?.id;
      if (!roleId) {
        roleId = uuidv4();
        await db.query(
          "INSERT INTO roles (id, name, created_date, last_modified_date) VALUES ($1, 'ROLE_USER', $2, $2) ON CONFLICT (name) DO NOTHING",
          [roleId, now]
        );
      }
      await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
        userId,
        roleId,
      ]);

      // Generate verification token (expires_at)
      const rawToken = generateSecureToken(32);
      const tokenHash = hashToken(rawToken);
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.query(
        `INSERT INTO email_verification_tokens (
          id, user_id, token_hash, expires_at, used, created_date, last_modified_date
        ) VALUES ($1, $2, $3, $4, false, $5, $5)`,
        [uuidv4(), userId, tokenHash, expiry, now]
      );

      console.log(`[EmailVerification] Token for ${email}: ${rawToken}`);
    } else {
      const existing = memoryDb.users.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        throw new BusinessException('EMAIL_ALREADY_EXISTS', 'The provided email address cannot be used.');
      }

      const passwordHash = await hashPassword(data.password);
      const userId = uuidv4();
      const now = new Date();

      const newUser = {
        id: userId,
        email,
        password: passwordHash,
        full_name: data.fullName.trim(),
        phone_number: null,
        profile_picture_url: null,
        is_active: true,
        is_email_verified: false,
        is_phone_verified: false,
        is_account_non_locked: true,
        failed_login_attempts: 0,
        temporary_locked_until: null,
        created_date: now,
        last_modified_date: now,
        password_updated_at: now,
      };

      memoryDb.users.push(newUser);

      const userRole = memoryDb.roles.find((r) => r.name === 'ROLE_USER' || r.name === 'USER');
      if (userRole) {
        memoryDb.user_roles.push({ user_id: userId, role_id: userRole.id });
      }

      const rawToken = generateSecureToken(32);
      const tokenHash = hashToken(rawToken);
      memoryDb.email_verification_tokens.push({
        id: uuidv4(),
        user_id: userId,
        token_hash: tokenHash,
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        used: false,
        created_date: now,
        last_modified_date: now,
      });

      console.log(`[EmailVerification] Token for ${email}: ${rawToken}`);
    }

    return { message: 'User registered successfully. Please verify your email.' };
  }

  async login(data: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    hasPassword: boolean;
    has_password: boolean;
    message: string;
  }> {
    const email = data.email.toLowerCase().trim();
    let user: any = null;
    let roles: string[] = [];

    if (isPostgres()) {
      const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (res.rows.length === 0) {
        throw new BusinessException('BAD_CREDENTIALS', 'Invalid email or password.');
      }
      user = res.rows[0];

      const rolesRes = await db.query(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [user.id]
      );
      roles = rolesRes.rows.map((r: { name: string }) => r.name);
    } else {
      user = memoryDb.users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        throw new BusinessException('BAD_CREDENTIALS', 'Invalid email or password.');
      }
      const userRoleIds = memoryDb.user_roles
        .filter((ur) => ur.user_id === user.id)
        .map((ur) => ur.role_id);
      roles = memoryDb.roles
        .filter((r) => userRoleIds.includes(r.id))
        .map((r) => r.name);
    }

    // Check account status
    const isActive = user.enabled !== undefined ? !!user.enabled : !!user.is_active;
    if (!isActive) {
      throw new BusinessException('ERR_USER_DISABLED', 'Your account is disabled');
    }

    const isNonLocked = user.account_locked !== undefined ? !user.account_locked : !!user.is_account_non_locked;
    if (!isNonLocked) {
      throw new BusinessException('PERMANENT_ACCOUNT_LOCKED', 'Your account is permanently locked');
    }

    if (user.temporary_locked_until && new Date(user.temporary_locked_until) > new Date()) {
      throw new BusinessException(
        'ACCOUNT_LOCKED',
        'Your account is temporarily locked due to too many failed login attempts.'
      );
    }

    if (!user.password) {
      throw new BusinessException(
        'PASSWORD_LOGIN_NOT_AVAILABLE',
        'Password login is not available for this account. Use OAuth login or set a password first.'
      );
    }

    const matches = await comparePassword(data.password, user.password);
    if (!matches) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil: Date | null = null;

      if (attempts >= ENV.MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + ENV.LOCK_DURATION_MINUTES * 60 * 1000);
      }

      if (isPostgres()) {
        await db.query(
          'UPDATE users SET failed_login_attempts = $1, temporary_locked_until = $2 WHERE id = $3',
          [attempts, lockUntil, user.id]
        );
      } else {
        user.failed_login_attempts = attempts;
        user.temporary_locked_until = lockUntil;
      }

      if (lockUntil) {
        throw new BusinessException(
          'ACCOUNT_LOCKED',
          'Your account is temporarily locked due to too many failed login attempts.'
        );
      }

      throw new BusinessException('BAD_CREDENTIALS', 'Invalid email or password.');
    }

    // Reset failed attempts on success
    if (isPostgres()) {
      await db.query(
        'UPDATE users SET failed_login_attempts = 0, temporary_locked_until = NULL WHERE id = $1',
        [user.id]
      );
    } else {
      user.failed_login_attempts = 0;
      user.temporary_locked_until = null;
    }

    const accessToken = signAccessToken(user.id, user.email, roles);
    const { token: refreshToken } = signRefreshToken(user.id);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + ENV.JWT_REFRESH_EXPIRATION_MS);
    const now = new Date();

    if (isPostgres()) {
      await db.query(
        `INSERT INTO refresh_token_sessions (
          id, user_id, token_hash, device_name, expires_at, revoked, created_date, last_modified_date
        ) VALUES ($1, $2, $3, 'Web Client', $4, false, $5, $5)`,
        [uuidv4(), user.id, tokenHash, expiresAt, now]
      );
    } else {
      memoryDb.refresh_token_sessions.push({
        id: uuidv4(),
        user_id: user.id,
        token_hash: tokenHash,
        issued_at: now,
        expires_at: expiresAt,
        revoked: false,
        created_date: now,
        last_modified_date: now,
      });
    }

    return {
      accessToken,
      refreshToken,
      hasPassword: true,
      has_password: true,
      message: 'User authenticated successfully',
    };
  }

  async refreshToken(rawRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    hasPassword: boolean;
    has_password: boolean;
    message: string;
  }> {
    if (!rawRefreshToken) {
      throw new BusinessException('INVALID_REFRESH_TOKEN', 'The refresh token is invalid or has expired.');
    }

    const payload = verifyToken(rawRefreshToken);
    if (!payload || !payload.sub || payload.type !== 'refresh') {
      throw new BusinessException('INVALID_REFRESH_TOKEN', 'The refresh token is invalid or has expired.');
    }

    const hashed = hashToken(rawRefreshToken);
    let session: any = null;
    let user: any = null;
    let roles: string[] = [];

    if (isPostgres()) {
      const sessRes = await db.query(
        'SELECT * FROM refresh_token_sessions WHERE token_hash = $1',
        [hashed]
      );
      if (sessRes.rows.length === 0) {
        throw new BusinessException('INVALID_REFRESH_TOKEN', 'The refresh token is invalid or has expired.');
      }
      session = sessRes.rows[0];

      if (session.revoked) {
        // Reuse detected! Invalidate all sessions for user
        await db.query('UPDATE refresh_token_sessions SET revoked = true WHERE user_id = $1', [session.user_id]);
        throw new BusinessException('REFRESH_TOKEN_REUSE_DETECTED', 'Refresh token reuse detected');
      }

      if (new Date(session.expires_at) < new Date()) {
        throw new BusinessException('INVALID_REFRESH_TOKEN', 'The refresh token is invalid or has expired.');
      }

      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [session.user_id]);
      if (userRes.rows.length === 0) {
        throw new BusinessException('USER_NOT_FOUND', 'User not found.');
      }
      user = userRes.rows[0];

      const rolesRes = await db.query(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [user.id]
      );
      roles = rolesRes.rows.map((r: { name: string }) => r.name);

      // Revoke old session
      await db.query('UPDATE refresh_token_sessions SET revoked = true, revoked_at = $1 WHERE id = $2', [
        new Date(),
        session.id,
      ]);
    } else {
      session = memoryDb.refresh_token_sessions.find((s) => s.token_hash === hashed);
      if (!session) {
        throw new BusinessException('INVALID_REFRESH_TOKEN', 'The refresh token is invalid or has expired.');
      }

      if (session.revoked) {
        memoryDb.refresh_token_sessions
          .filter((s) => s.user_id === session.user_id)
          .forEach((s) => (s.revoked = true));
        throw new BusinessException('REFRESH_TOKEN_REUSE_DETECTED', 'Refresh token reuse detected');
      }

      if (new Date(session.expires_at) < new Date()) {
        throw new BusinessException('INVALID_REFRESH_TOKEN', 'The refresh token is invalid or has expired.');
      }

      user = memoryDb.users.find((u) => u.id === session.user_id);
      if (!user) {
        throw new BusinessException('USER_NOT_FOUND', 'User not found.');
      }

      const userRoleIds = memoryDb.user_roles
        .filter((ur) => ur.user_id === user.id)
        .map((ur) => ur.role_id);
      roles = memoryDb.roles
        .filter((r) => userRoleIds.includes(r.id))
        .map((r) => r.name);

      session.revoked = true;
      session.revoked_at = new Date();
    }

    // Generate new rotated pair
    const newAccessToken = signAccessToken(user.id, user.email, roles);
    const { token: newRefreshToken } = signRefreshToken(user.id);
    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + ENV.JWT_REFRESH_EXPIRATION_MS);
    const now = new Date();

    if (isPostgres()) {
      await db.query(
        `INSERT INTO refresh_token_sessions (
          id, user_id, token_hash, device_name, expires_at, revoked, created_date, last_modified_date
        ) VALUES ($1, $2, $3, 'Web Client', $4, false, $5, $5)`,
        [uuidv4(), user.id, newTokenHash, newExpiresAt, now]
      );
    } else {
      memoryDb.refresh_token_sessions.push({
        id: uuidv4(),
        user_id: user.id,
        token_hash: newTokenHash,
        issued_at: now,
        expires_at: newExpiresAt,
        revoked: false,
        created_date: now,
        last_modified_date: now,
      });
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      hasPassword: !!user.password,
      has_password: !!user.password,
      message: 'Authentication tokens refreshed successfully',
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const hashed = hashToken(rawRefreshToken);
    if (isPostgres()) {
      await db.query('UPDATE refresh_token_sessions SET revoked = true, revoked_at = $1 WHERE token_hash = $2', [
        new Date(),
        hashed,
      ]);
    } else {
      const sess = memoryDb.refresh_token_sessions.find((s) => s.token_hash === hashed);
      if (sess) {
        sess.revoked = true;
        sess.revoked_at = new Date();
      }
    }
  }

  async logoutAll(userId: string): Promise<void> {
    if (isPostgres()) {
      await db.query('UPDATE refresh_token_sessions SET revoked = true, revoked_at = $1 WHERE user_id = $2', [
        new Date(),
        userId,
      ]);
    } else {
      memoryDb.refresh_token_sessions
        .filter((s) => s.user_id === userId)
        .forEach((s) => {
          s.revoked = true;
          s.revoked_at = new Date();
        });
    }
  }

  async verifyEmail(rawToken: string): Promise<{ message: string }> {
    if (!rawToken) {
      throw new BusinessException('INVALID_VERIFICATION_TOKEN', 'The email verification request is invalid.');
    }
    const hashed = hashToken(rawToken);

    if (isPostgres()) {
      const res = await db.query('SELECT * FROM email_verification_tokens WHERE token_hash = $1', [hashed]);
      if (res.rows.length === 0) {
        throw new BusinessException('INVALID_VERIFICATION_TOKEN', 'The email verification request is invalid.');
      }
      const tok = res.rows[0];
      if (tok.used) {
        throw new BusinessException('VERIFICATION_TOKEN_ALREADY_USED', 'The email verification request has already been completed.');
      }
      if (new Date(tok.expires_at || tok.expiry_date) < new Date()) {
        throw new BusinessException('VERIFICATION_TOKEN_EXPIRED', 'The email verification request has expired.');
      }

      await db.query('UPDATE email_verification_tokens SET used = true, last_modified_date = $1 WHERE id = $2', [new Date(), tok.id]);
      await db.query('UPDATE users SET email_verified = true, last_modified_date = $1 WHERE id = $2', [new Date(), tok.user_id]);
    } else {
      const tok = memoryDb.email_verification_tokens.find((t) => t.token_hash === hashed);
      if (!tok) {
        throw new BusinessException('INVALID_VERIFICATION_TOKEN', 'The email verification request is invalid.');
      }
      if (tok.used) {
        throw new BusinessException('VERIFICATION_TOKEN_ALREADY_USED', 'The email verification request has already been completed.');
      }
      if (new Date(tok.expires_at || tok.expiry_date) < new Date()) {
        throw new BusinessException('VERIFICATION_TOKEN_EXPIRED', 'The email verification request has expired.');
      }
      tok.used = true;
      tok.used_at = new Date();
      const user = memoryDb.users.find((u) => u.id === tok.user_id);
      if (user) {
        user.is_email_verified = true;
        user.email_verified = true;
      }
    }

    return { message: 'Email verified successfully.' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user: any = null;
    if (isPostgres()) {
      const res = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (res.rows.length > 0) {
        user = res.rows[0];
        await db.query(
          `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_date, last_modified_date)
           VALUES ($1, $2, $3, $4, false, $5, $5)`,
          [uuidv4(), user.id, tokenHash, expiry, new Date()]
        );
      }
    } else {
      user = memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (user) {
        memoryDb.password_reset_tokens.push({
          id: uuidv4(),
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiry,
          expiry_date: expiry,
          used: false,
          created_date: new Date(),
          last_modified_date: new Date(),
        });
      }
    }

    console.log(`[PasswordReset] Reset token for ${email}: ${rawToken}`);
    return { message: 'If an account exists with that email, a password reset link has been dispatched.' };
  }

  async resetPassword(token: string, newPass: string): Promise<{ message: string }> {
    const hashed = hashToken(token);
    let tok: any = null;

    if (isPostgres()) {
      const res = await db.query('SELECT * FROM password_reset_tokens WHERE token_hash = $1', [hashed]);
      if (res.rows.length === 0) {
        throw new BusinessException('INVALID_PASSWORD_RESET_TOKEN', 'The password reset request is invalid.');
      }
      tok = res.rows[0];
      if (tok.used) {
        throw new BusinessException('PASSWORD_RESET_TOKEN_ALREADY_USED', 'The password reset request has already been used.');
      }
      if (new Date(tok.expires_at || tok.expiry_date) < new Date()) {
        throw new BusinessException('PASSWORD_RESET_TOKEN_EXPIRED', 'The password reset request has expired.');
      }

      const passHash = await hashPassword(newPass);
      await db.query('UPDATE users SET password = $1, password_changed_at = $2, last_modified_date = $2 WHERE id = $3', [
        passHash,
        new Date(),
        tok.user_id,
      ]);
      await db.query('UPDATE password_reset_tokens SET used = true, used_at = $1, last_modified_date = $1 WHERE id = $2', [
        new Date(),
        tok.id,
      ]);
    } else {
      tok = memoryDb.password_reset_tokens.find((t) => t.token_hash === hashed);
      if (!tok) {
        throw new BusinessException('INVALID_PASSWORD_RESET_TOKEN', 'The password reset request is invalid.');
      }
      if (tok.used) {
        throw new BusinessException('PASSWORD_RESET_TOKEN_ALREADY_USED', 'The password reset request has already been used.');
      }
      if (new Date(tok.expiry_date) < new Date()) {
        throw new BusinessException('PASSWORD_RESET_TOKEN_EXPIRED', 'The password reset request has expired.');
      }

      const passHash = await hashPassword(newPass);
      const user = memoryDb.users.find((u) => u.id === tok.user_id);
      if (user) {
        user.password = passHash;
        user.password_updated_at = new Date();
      }
      tok.used = true;
      tok.used_at = new Date();
    }

    return { message: 'Password has been reset successfully.' };
  }

  async exchangeOAuthCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    hasPassword: boolean;
    has_password: boolean;
    message: string;
  }> {
    const codeHash = hashToken(code);
    let codeEntry: any = null;
    let user: any = null;
    let roles: string[] = [];

    if (isPostgres()) {
      const res = await db.query('SELECT * FROM oauth_login_codes WHERE code_hash = $1', [codeHash]);
      if (res.rows.length === 0) {
        throw new BusinessException('INVALID_OAUTH_LOGIN_CODE', 'Invalid OAuth login code');
      }
      codeEntry = res.rows[0];
      if (codeEntry.used) {
        throw new BusinessException('OAUTH_LOGIN_CODE_ALREADY_USED', 'OAuth login code has already been used');
      }
      if (new Date(codeEntry.expiry_date) < new Date()) {
        throw new BusinessException('OAUTH_LOGIN_CODE_EXPIRED', 'OAuth login code has expired');
      }

      await db.query('UPDATE oauth_login_codes SET used = true, used_at = $1 WHERE id = $2', [new Date(), codeEntry.id]);

      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [codeEntry.user_id]);
      user = userRes.rows[0];

      const rolesRes = await db.query(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [user.id]
      );
      roles = rolesRes.rows.map((r: { name: string }) => r.name);
    } else {
      codeEntry = memoryDb.oauth_login_codes.find((c) => c.code_hash === codeHash);
      if (!codeEntry) {
        throw new BusinessException('INVALID_OAUTH_LOGIN_CODE', 'Invalid OAuth login code');
      }
      if (codeEntry.used) {
        throw new BusinessException('OAUTH_LOGIN_CODE_ALREADY_USED', 'OAuth login code has already been used');
      }
      if (new Date(codeEntry.expiry_date) < new Date()) {
        throw new BusinessException('OAUTH_LOGIN_CODE_EXPIRED', 'OAuth login code has expired');
      }
      codeEntry.used = true;
      codeEntry.used_at = new Date();

      user = memoryDb.users.find((u) => u.id === codeEntry.user_id);
      const userRoleIds = memoryDb.user_roles.filter((ur) => ur.user_id === user.id).map((ur) => ur.role_id);
      roles = memoryDb.roles.filter((r) => userRoleIds.includes(r.id)).map((r) => r.name);
    }

    const accessToken = signAccessToken(user.id, user.email, roles);
    const { token: refreshToken } = signRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      hasPassword: !!user.password,
      has_password: !!user.password,
      message: 'OAuth exchange successful',
    };
  }
}

export const authService = new AuthService();
