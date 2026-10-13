import fs from 'fs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env.js';

let privateKey: string | Buffer | null = null;
let publicKey: string | Buffer | null = null;

try {
  if (ENV.JWT_PRIVATE_KEY_PATH && fs.existsSync(ENV.JWT_PRIVATE_KEY_PATH)) {
    privateKey = fs.readFileSync(ENV.JWT_PRIVATE_KEY_PATH);
  }
  if (ENV.JWT_PUBLIC_KEY_PATH && fs.existsSync(ENV.JWT_PUBLIC_KEY_PATH)) {
    publicKey = fs.readFileSync(ENV.JWT_PUBLIC_KEY_PATH);
  }
} catch {
  // Fall back to HMAC secret
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  type?: string;
  jti?: string;
}

export function signAccessToken(userId: string, email: string, roles: string[]): string {
  const payload = {
    sub: userId,
    email,
    roles,
  };

  const expiresInSec = Math.floor(ENV.JWT_ACCESS_EXPIRATION_MS / 1000);

  if (privateKey) {
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: expiresInSec,
    });
  }

  return jwt.sign(payload, ENV.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: expiresInSec,
  });
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = uuidv4();
  const payload = {
    sub: userId,
    type: 'refresh',
    jti,
  };

  const expiresInSec = Math.floor(ENV.JWT_REFRESH_EXPIRATION_MS / 1000);

  let token: string;
  if (privateKey) {
    token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: expiresInSec,
    });
  } else {
    token = jwt.sign(payload, ENV.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: expiresInSec,
    });
  }

  return { token, jti };
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const key = publicKey || ENV.JWT_SECRET;
    return jwt.verify(token, key) as JwtPayload;
  } catch {
    return null;
  }
}
