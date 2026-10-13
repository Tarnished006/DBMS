import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = Router();

// Secure all admin routes with auth and admin role check
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));

// Users
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.get('/users/:userId', (req, res, next) => adminController.getUserById(req, res, next));
router.patch('/users/:userId/activate', (req, res, next) => adminController.activateUser(req, res, next));
router.patch('/users/:userId/deactivate', (req, res, next) =>
  adminController.deactivateUser(req, res, next)
);
router.patch('/users/:userId/lock', (req, res, next) => adminController.lockUser(req, res, next));
router.patch('/users/:userId/unlock', (req, res, next) => adminController.unlockUser(req, res, next));

// Products
router.get('/products', (req, res, next) => adminController.getProducts(req, res, next));
router.get('/products/:productId', (req, res, next) => adminController.getProductById(req, res, next));
router.patch('/products/:productId/status', (req, res, next) =>
  adminController.updateProductStatus(req, res, next)
);
router.delete('/products/:productId', (req, res, next) =>
  adminController.deleteProduct(req, res, next)
);

// Product Images
router.post(
  '/products/:productId/images',
  uploadSingleImage.single('file'),
  (req, res, next) => adminController.uploadProductImage(req, res, next)
);
router.get('/products/:productId/images', (req, res, next) =>
  adminController.getProductImages(req, res, next)
);
router.patch('/products/:productId/images/:imageId', (req, res, next) =>
  adminController.updateProductImageOrder(req, res, next)
);
router.patch('/products/:productId/images/:imageId/primary', (req, res, next) =>
  adminController.setPrimaryProductImage(req, res, next)
);
router.delete('/products/:productId/images/:imageId', (req, res, next) =>
  adminController.deleteProductImage(req, res, next)
);

// Product Inventory
router.get('/products/:productId/inventory', (req, res, next) =>
  adminController.getProductInventory(req, res, next)
);
router.patch('/products/:productId/inventory', (req, res, next) =>
  adminController.updateProductInventory(req, res, next)
);
router.post('/products/:productId/inventory/add', (req, res, next) =>
  adminController.addStock(req, res, next)
);
router.post('/products/:productId/inventory/remove', (req, res, next) =>
  adminController.removeStock(req, res, next)
);

// Orders
router.get('/orders', (req, res, next) => adminController.getOrders(req, res, next));
router.get('/orders/:orderId', (req, res, next) => adminController.getOrderById(req, res, next));
router.patch('/orders/:orderId/status', (req, res, next) =>
  adminController.updateOrderStatus(req, res, next)
);

// Payments
router.get('/payments', (req, res, next) => adminController.getPayments(req, res, next));
router.get('/payments/:paymentId', (req, res, next) => adminController.getPaymentById(req, res, next));
router.get('/payments/status/:status', (req, res, next) =>
  adminController.getPaymentsByStatus(req, res, next)
);

// Payment Transactions
router.get('/payment-transactions', (req, res, next) =>
  adminController.getPaymentTransactions(req, res, next)
);
router.get('/payment-transactions/type/:transactionType', (req, res, next) =>
  adminController.getPaymentTransactionsByType(req, res, next)
);
router.get('/payment-transactions/status/:status', (req, res, next) =>
  adminController.getPaymentTransactionsByStatus(req, res, next)
);
router.get('/payment-transactions/payment/:paymentId', (req, res, next) =>
  adminController.getPaymentTransactionsByPaymentId(req, res, next)
);

// Deliveries
router.get('/deliveries', (req, res, next) => adminController.getDeliveries(req, res, next));
router.get('/deliveries/:deliveryId', (req, res, next) =>
  adminController.getDeliveryById(req, res, next)
);
router.put('/deliveries/:deliveryId/ship', (req, res, next) =>
  adminController.shipDelivery(req, res, next)
);
router.put('/deliveries/:deliveryId/out-for-delivery', (req, res, next) =>
  adminController.outForDelivery(req, res, next)
);

export default router;
