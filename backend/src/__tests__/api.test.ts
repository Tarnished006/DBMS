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

    it('POST /api/v1/products should create product with frontend payload (price, categoryId, address)', async () => {
      const catRes = await request(app).get('/api/v1/categories');
      const catId = catRes.body[0].id;

      const createRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          categoryId: catId,
          name: 'Organic Cavendish Bananas',
          description: 'Naturally ripened organic fresh farm bananas',
          price: 45,
          unit: 'KG',
          quantity: 150,
          villageOrTown: 'Dharwad Farm Hub',
          city: 'Dharwad',
          pinCode: '580001',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.id).toBeDefined();
      expect(createRes.body.name).toBe('Organic Cavendish Bananas');
      expect(createRes.body.price).toBe(45);
      expect(createRes.body.pricePerUnit).toBe(45);
      expect(createRes.body.quantity).toBe(150);
    });

    it('POST /api/v1/products should reject with validation error when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Incomplete Crop',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.validationErrors)).toBe(true);
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
      const list = Array.isArray(res.body) ? res.body : res.body.dailyForecast;
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(5);
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

    it('GET /api/v1/market-prices should return authentic mandis for non-Karnataka states', async () => {
      for (const st of ['Assam', 'Maharashtra', 'Kerala', 'Delhi']) {
        const res = await request(app).get(`/api/v1/market-prices?state=${encodeURIComponent(st)}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.prices)).toBe(true);
        expect(res.body.prices.length).toBeGreaterThan(0);
        // Ensure no state leakage
        for (const p of res.body.prices) {
          expect(p.state.toLowerCase()).not.toBe('karnataka');
        }
      }
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

  describe('8. Bilateral Farmer-Buyer Negotiation Engine', () => {
    let testProduceId = '';
    let negotiationId = '';

    it('POST /api/v1/negotiations should allow buyer to make a proposed price offer', async () => {
      const catalogRes = await request(app).get('/api/v1/products');
      const farmerProd = catalogRes.body.content.find((p: any) => p.farmerId !== '11111111-2222-3333-4444-555555555555');
      testProduceId = farmerProd ? farmerProd.id : catalogRes.body.content[0].id;

      // userToken acts as buyer making offer to farmer (adminToken owns seed products)
      const res = await request(app)
        .post('/api/v1/negotiations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          produceId: testProduceId,
          quantity: 100,
          proposedPrice: 28,
          unit: 'KG',
          buyerNotes: 'Need 100kg bulk for catering, requesting ₹28/kg',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('PENDING');
      expect(res.body.proposedPrice).toBe(28);
      negotiationId = res.body.id;
    });

    it('GET /api/v1/negotiations/buyer should retrieve active negotiations for buyer', async () => {
      const res = await request(app)
        .get('/api/v1/negotiations/buyer')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/v1/negotiations/:id/counter should allow farmer to counter-offer', async () => {
      const res = await request(app)
        .patch(`/api/v1/negotiations/${negotiationId}/counter`)
        .set('Authorization', `Bearer ${adminToken}`) // adminToken is the farmer who owns produce
        .send({
          counterPrice: 32,
          farmerNotes: 'Can do ₹32/kg for farm-gate pickup',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COUNTERED');
      expect(res.body.counterPrice).toBe(32);
    });

    it('PATCH /api/v1/negotiations/:id/accept should allow buyer to accept counter-offer', async () => {
      const res = await request(app)
        .patch(`/api/v1/negotiations/${negotiationId}/accept`)
        .set('Authorization', `Bearer ${userToken}`); // buyer accepts

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ACCEPTED');
      expect(res.body.finalPrice).toBe(32);
    });
  });

  describe('9. Buyer Demand Board & Reverse Bidding', () => {
    let demandId = '';

    it('POST /api/v1/demands should allow bulk buyers to post produce requirements', async () => {
      const res = await request(app)
        .post('/api/v1/demands')
        .set('Authorization', `Bearer ${adminToken}`) // admin acts as restaurant/bulk buyer
        .send({
          cropName: 'Grade-A Potatoes',
          quantityNeeded: 500,
          unit: 'KG',
          targetPricePerUnit: 24,
          qualityGrade: 'GRADE_A',
          requiredByDate: '2026-10-25',
          deliveryCity: 'Bengaluru',
          description: 'Weekly restaurant supply needed, crisp grade-A required.',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('OPEN');
      expect(res.body.targetPricePerUnit).toBe(24);
      demandId = res.body.id;
    });

    it('GET /api/v1/demands should list open buyer demands publicly', async () => {
      const res = await request(app).get('/api/v1/demands');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/demands/:id/bids should allow farmer to place a fulfillment bid', async () => {
      const res = await request(app)
        .post(`/api/v1/demands/${demandId}/bids`)
        .set('Authorization', `Bearer ${userToken}`) // farmer places bid
        .send({
          offeredQuantity: 500,
          offeredPricePerUnit: 25,
          notes: 'Freshly harvested Hasan potatoes ready for Friday delivery.',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.offeredPricePerUnit).toBe(25);
    });
  });

  describe('10. Village Produce Pooling (Shared Freight)', () => {
    it('GET /api/v1/pools should calculate consolidated regional produce lots', async () => {
      const res = await request(app).get('/api/v1/pools');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].cropName).toBeDefined();
        expect(res.body[0].totalQuantity).toBeGreaterThan(0);
        expect(res.body[0].estimatedFreightSavingsPercentage).toBeGreaterThanOrEqual(45);
      }
    });
  });

  describe('11. OTP Systems (Phone Verification & Universal Demo Fallback)', () => {
    let generatedOtp = '';

    it('POST /api/v1/users/me/phone/send-otp with formatted phone should generate and return OTP', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/phone/send-otp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phoneNumber: '+91 91234 56789',
        });

      expect(res.status).toBe(200);
      expect(res.body.otp).toBeDefined();
      expect(res.body.otp.length).toBe(6);
      expect(res.body.message).toContain('OTP sent successfully');
      generatedOtp = res.body.otp;
    });

    it('POST /api/v1/users/me/phone/verify-otp with incorrect OTP should fail', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/phone/verify-otp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phoneNumber: '9123456789',
          otp: '000000',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_PHONE_OTP');
    });

    it('POST /api/v1/users/me/phone/verify-otp with generated OTP should verify phone', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/phone/verify-otp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phoneNumber: '9123456789',
          otp: generatedOtp,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const profileRes = await request(app)
        .get('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.phoneVerified).toBe(true);
      expect(profileRes.body.phoneNumber).toBe('9123456789');
    });

    it('POST /api/v1/users/me/phone/verify-otp should accept demo code 123456 as universal fallback', async () => {
      await request(app)
        .post('/api/v1/users/me/phone/send-otp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phoneNumber: '9888877777',
        });

      const res = await request(app)
        .post('/api/v1/users/me/phone/verify-otp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phoneNumber: '9888877777',
          otp: '123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
