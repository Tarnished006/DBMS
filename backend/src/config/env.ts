import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',

  // Database
  DB_URL: process.env.DATABASE_URL || process.env.DB_URL || '',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'agrimarket',
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',

  // Frontend & CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  FRONTEND_OAUTH2_SUCCESS_URL:
    process.env.FRONTEND_OAUTH2_SUCCESS_URL || 'http://localhost:5173/auth/oauth2/callback',
  CORS_ALLOWED_ORIGINS: (
    process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim()),

  // Security & JWT
  JWT_SECRET: process.env.JWT_SECRET || 'agri_market_production_super_secure_secret_key_2026_dev_fallback',
  JWT_PRIVATE_KEY_PATH: process.env.JWT_PRIVATE_KEY_PATH,
  JWT_PUBLIC_KEY_PATH: process.env.JWT_PUBLIC_KEY_PATH,
  JWT_ACCESS_EXPIRATION_MS: parseInt(process.env.JWT_ACCESS_EXPIRATION_MS || '86400000', 10), // 24h
  JWT_REFRESH_EXPIRATION_MS: parseInt(process.env.JWT_REFRESH_EXPIRATION_MS || '604800000', 10), // 7d

  // Login attempt protection
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 15,

  // Admin init
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL || 'admin@agrimarket.com',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123',
  INITIAL_ADMIN_PHONE: process.env.INITIAL_ADMIN_PHONE || '9876543210',

  // External APIs
  GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  PERENUAL_API_KEY: process.env.PERENUAL_API_KEY || '',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'support@agrimarket.com',
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'AgriMarket',
  BREVO_URL: process.env.BREVO_URL || 'https://api.brevo.com/v3/smtp/email',
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || '',
  MSG91_OTP_TEMPLATE_ID: process.env.MSG91_OTP_TEMPLATE_ID || '',

  // Cookies
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
};
