import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import addressRoutes from './routes/address.routes.js';
import locationRoutes from './routes/location.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import paymentTransactionRoutes from './routes/paymentTransaction.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import cropInfoRoutes from './routes/cropInfo.routes.js';
import marketPriceRoutes from './routes/marketPrice.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import adminRoutes from './routes/admin.routes.js';
import negotiationRoutes from './routes/negotiation.routes.js';
import demandRoutes from './routes/demand.routes.js';
import poolRoutes from './routes/pool.routes.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS configuration matching Spring Boot Security
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (
          ENV.CORS_ALLOWED_ORIGINS.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly permissive origin
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-TOKEN'],
    })
  );

  // 3. Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 4. Welcome & Health Check
  app.get('/', (_req, res) => {
    res.json({
      name: 'AgriMarket Production API',
      status: 'ONLINE',
      health: '/api/health',
      endpoints: {
        categories: '/api/v1/categories',
        products: '/api/v1/products',
        marketPrices: '/api/v1/market-prices',
        demands: '/api/v1/demands',
        negotiations: '/api/v1/negotiations',
        pools: '/api/v1/pools',
        weather: '/api/v1/weather',
        crops: '/api/v1/crops/info',
      },
      message: 'AgriMarket REST API is running. Connect the frontend web client to interact with the full marketplace.',
    });
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'AgriMarket Production API',
    });
  });

  // 5. Mount API Routes (/api/v1/...)
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/user/dashboard', dashboardRoutes);
  app.use('/api/v1/addresses', addressRoutes);
  app.use('/api/v1/locations', locationRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/checkout', checkoutRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/payment-transactions', paymentTransactionRoutes);
  app.use('/api/v1/deliveries', deliveryRoutes);
  app.use('/api/v1/crops/info', cropInfoRoutes);
  app.use('/api/v1/market-prices', marketPriceRoutes);
  app.use('/api/v1/weather', weatherRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/negotiations', negotiationRoutes);
  app.use('/api/v1/demands', demandRoutes);
  app.use('/api/v1/pools', poolRoutes);

  // 6. 404 Resource Not Found Handler
  app.use((_req, res) => {
    res.status(404).json({
      code: 'RESOURCE_NOT_FOUND',
      message: 'The requested resource was not found.',
    });
  });

  // 7. Global Error Handler
  app.use(errorHandler);

  return app;
}
