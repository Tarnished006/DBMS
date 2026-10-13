import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { initDatabase } from '../db/dbAdapter.js';

describe('AgriMarket Backend API End-to-End Suite', () => {
  let app: any;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await initDatabase();
    app = createApp();

    // Authenticate Admin
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@agrimarket.com',
        password: 'Admin@123',
      });

    expect(adminLoginRes.status).toBe(200);
    expect(adminLoginRes.body.accessToken).toBeDefined();
    adminToken = adminLoginRes.body.accessToken;

    // Authenticate Demo User
    const userLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@agrimarket.com',
        password: 'User@123',
      });

    expect(userLoginRes.status).toBe(200);
    expect(userLoginRes.body.accessToken).toBeDefined();
    userToken = userLoginRes.body.accessToken;
  });

  describe('1. System & Health Check', () => {
    it('GET /api/health should return UP status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });

    it('Unmatched route should return standard 404 RESOURCE_NOT_FOUND', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('2. Authentication & Authorization Flows', () => {
    it('POST /api/v1/auth/login with wrong credentials should return 401 BAD_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@agrimarket.com',
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('BAD_CREDENTIALS');
    });

    it('POST /api/v1/auth/register with invalid email should return 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email: 'not-an-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.validationErrors)).toBe(true);
    });

    it('GET /api/v1/users/me/profile without token should return 404 or 401', async () => {
      const res = await request(app).get('/api/v1/users/me/profile');
      expect([401, 404]).toContain(res.status);
    });

    it('GET /api/v1/users/me/profile with valid user token should return profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('user@agrimarket.com');
      expect(res.body.fullName).toBe('Ramesh Gowda');
    });
  });

  describe('3. Categories & Location Catalog', () => {
    it('GET /api/v1/categories should return all seeded categories', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(6);
      const names = res.body.map((c: any) => c.name);
      expect(names).toContain('Seeds');
      expect(names).toContain('Fertilizers');
      expect(names).toContain('Farm Equipment');
    });

    it('GET /api/v1/locations/states should return Karnataka', async () => {
      const res = await request(app).get('/api/v1/locations/states');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const ka = res.body.find((s: any) => s.code === 'KA');
      expect(ka).toBeDefined();
    });
  });

  describe('4. Products Marketplace & Inventory', () => {
    it('GET /api/v1/products should return paginated catalog', async () => {
      const res = await request(app).get('/api/v1/products?page=0&size=10');
      expect(res.status).toBe(200);
      expect(res.body.content).toBeDefined();
      expect(res.body.content.length).toBeGreaterThan(0);
      expect(res.body.totalElements).toBeGreaterThan(0);
    });

    it('GET /api/v1/products/search should filter by search term', async () => {
      const res = await request(app).get('/api/v1/products/search?q=Sona');
      expect(res.status).toBe(200);
      expect(res.body.content.length).toBeGreaterThan(0);
      expect(res.body.content[0].name).toContain('Sona Masoori');
    });

    it('GET /api/v1/products/:id/availability should check available stock', async () => {
      const catalogRes = await request(app).get('/api/v1/products');
      const prodId = catalogRes.body.content[0].id;

      const availRes = await request(app).get(`/api/v1/products/${prodId}/availability?quantity=1`);
      expect(availRes.status).toBe(200);
      expect(availRes.body.available).toBe(true);
    });
  });

  describe('5. Weather & Farming Risk Engine', () => {
    it('GET /api/v1/weather/risk/daily should calculate deterministic composite risk', async () => {
      const res = await request(app).get('/api/v1/weather/risk/daily?latitude=12.9716&longitude=77.5946');
      expect(res.status).toBe(200);
      expect(res.body.overallScore).toBeDefined();
      expect(res.body.overallLevel).toBeDefined();
      expect(res.body.risks).toBeDefined();
      expect(res.body.risks.rainfall).toBeDefined();
      expect(res.body.risks.wind).toBeDefined();
      expect(res.body.risks.spraying).toBeDefined();
      expect(res.body.risks.irrigation).toBeDefined();
    });

    it('GET /api/v1/weather/risk/weekly should calculate 7-day risk forecasts', async () => {
      const res = await request(app).get('/api/v1/weather/risk/weekly?latitude=12.9716&longitude=77.5946');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(7);
    });
  });

  describe('5b. Real-Time Mandi Market Prices API', () => {
    it('GET /api/v1/market-prices should return live APMC rates with prices array', async () => {
      const res = await request(app).get('/api/v1/market-prices?state=Karnataka&commodity=Tomato');
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
      expect(Array.isArray(res.body.prices)).toBe(true);
      expect(res.body.prices.length).toBeGreaterThan(0);
      const first = res.body.prices[0];
      expect(first.commodity).toBeDefined();
      expect(first.modalPrice).toBeGreaterThan(0);
      expect(first.market).toBeDefined();
    });

    it('GET /api/v1/market-prices/history should return price trend data', async () => {
      const res = await request(app).get('/api/v1/market-prices/history?commodity=Tomato');
      expect(res.status).toBe(200);
      expect(res.body.commodity).toBe('Tomato');
      expect(Array.isArray(res.body.prices)).toBe(true);
      expect(res.body.prices.length).toBeGreaterThanOrEqual(2);
    });
  });


  describe('6. Orders & Checkout Lifecycle', () => {
    it('POST /api/v1/checkout should create an order and reserve inventory', async () => {
      const catalogRes = await request(app).get('/api/v1/products');
      const prod = catalogRes.body.content[0];

      const checkoutRes = await request(app)
        .post('/api/v1/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddress: {
            addressLine1: 'Field 12, Rural Devanahalli',
            talukId: 'taluk-devanahalli',
            pinCode: '562110',
          },
          items: [
            {
              productId: prod.id,
              quantity: 2,
            },
          ],
        });

      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.body.id).toBeDefined();
      expect(checkoutRes.body.status).toBe('PENDING');
      expect(checkoutRes.body.totalAmount).toBeGreaterThan(0);
      expect(checkoutRes.body.items.length).toBe(1);
    });
  });

  describe('7. Admin Privileges & Governance Guards', () => {
    it('GET /api/v1/admin/dashboard should fail with 403 for normal user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCESS_DENIED');
    });

    it('GET /api/v1/admin/dashboard should succeed with 200 for admin user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBeGreaterThanOrEqual(2);
      expect(res.body.status).toBe('HEALTHY');
    });

    it('GET /api/v1/admin/users should list all users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });
});
