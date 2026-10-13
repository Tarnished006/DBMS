import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { productImageController } from '../controllers/productImage.controller.js';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { ProductCreateSchema, ProductUpdateSchema } from '../utils/validation.js';

const router = Router();

// 1. Static / Specific Subpaths First
router.get('/search', (req, res, next) => productController.searchProducts(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => productController.getMyProducts(req, res, next));
router.get('/me/search', authMiddleware, (req, res, next) =>
  productController.searchMyProducts(req, res, next)
);
router.get('/me/inventory', authMiddleware, (req, res, next) =>
  inventoryController.getMyInventory(req, res, next)
);

// 2. Collection Root
router.get('/', (req, res, next) => productController.getProducts(req, res, next));
router.post('/', authMiddleware, validateBody(ProductCreateSchema), (req, res, next) =>
  productController.createProduct(req, res, next)
);

// 3. Product Sub-resources
// Inventory
router.get('/:productId/availability', (req, res, next) =>
  inventoryController.getAvailability(req, res, next)
);
router.get('/:productId/inventory', (req, res, next) =>
  inventoryController.getProductInventory(req, res, next)
);
router.patch('/:productId/inventory', authMiddleware, (req, res, next) =>
  inventoryController.updateInventory(req, res, next)
);
router.post('/:productId/inventory/add', authMiddleware, (req, res, next) =>
  inventoryController.addStock(req, res, next)
);
router.post('/:productId/inventory/remove', authMiddleware, (req, res, next) =>
  inventoryController.removeStock(req, res, next)
);

// Location
router.get('/:productId/location', (req, res, next) =>
  productController.getProductLocation(req, res, next)
);

// Images
router.get('/:productId/images', (req, res, next) =>
  productImageController.getImages(req, res, next)
);
router.post(
  '/:productId/images',
  authMiddleware,
  uploadSingleImage.single('file'),
  (req, res, next) => productImageController.uploadImage(req, res, next)
);
router.patch('/:productId/images/:imageId', authMiddleware, (req, res, next) =>
  productImageController.updateOrder(req, res, next)
);
router.patch('/:productId/images/:imageId/primary', authMiddleware, (req, res, next) =>
  productImageController.setPrimary(req, res, next)
);
router.delete('/:productId/images/:imageId', authMiddleware, (req, res, next) =>
  productImageController.deleteImage(req, res, next)
);

// 4. Product Entity CRUD
router.get('/:productId', (req, res, next) => productController.getProductById(req, res, next));
router.patch('/:productId', authMiddleware, validateBody(ProductUpdateSchema), (req, res, next) =>
  productController.updateProduct(req, res, next)
);
router.delete('/:productId', authMiddleware, (req, res, next) =>
  productController.deleteProduct(req, res, next)
);

export default router;
