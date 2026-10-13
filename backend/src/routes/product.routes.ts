import { Router, Request, Response, NextFunction } from 'express';
import { productController } from '../controllers/product.controller.js';
import { productImageController } from '../controllers/productImage.controller.js';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import { ProductCreateSchema, ProductUpdateSchema } from '../utils/validation.js';

const router = Router();

// 1. Static / Specific Subpaths First
router.get('/search', (req: Request, res: Response, next: NextFunction) =>
  productController.searchProducts(req, res, next)
);
router.get('/me', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  productController.getMyProducts(req, res, next)
);
router.get('/me/search', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  productController.searchMyProducts(req, res, next)
);
router.get('/me/inventory', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  inventoryController.getMyInventory(req, res, next)
);

// 2. Collection Root
router.get('/', (req: Request, res: Response, next: NextFunction) =>
  productController.getProducts(req, res, next)
);
router.post(
  '/',
  authMiddleware,
  validateBody(ProductCreateSchema),
  (req: Request, res: Response, next: NextFunction) => productController.createProduct(req, res, next)
);

// 3. Product Sub-resources
// Inventory
router.get('/:productId/availability', (req: Request, res: Response, next: NextFunction) =>
  inventoryController.getAvailability(req, res, next)
);
router.get('/:productId/inventory', (req: Request, res: Response, next: NextFunction) =>
  inventoryController.getProductInventory(req, res, next)
);
router.patch('/:productId/inventory', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  inventoryController.updateInventory(req, res, next)
);
router.post('/:productId/inventory/add', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  inventoryController.addStock(req, res, next)
);
router.post('/:productId/inventory/remove', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  inventoryController.removeStock(req, res, next)
);

// Location
router.get('/:productId/location', (req: Request, res: Response, next: NextFunction) =>
  productController.getProductLocation(req, res, next)
);

// Images
router.get('/:productId/images', (req: Request, res: Response, next: NextFunction) =>
  productImageController.getImages(req, res, next)
);
router.post(
  '/:productId/images',
  authMiddleware,
  uploadSingleImage.single('file'),
  (req: Request, res: Response, next: NextFunction) => productImageController.uploadImage(req, res, next)
);
router.patch(
  '/:productId/images/:imageId',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => productImageController.updateOrder(req, res, next)
);
router.patch(
  '/:productId/images/:imageId/primary',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => productImageController.setPrimary(req, res, next)
);
router.delete(
  '/:productId/images/:imageId',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => productImageController.deleteImage(req, res, next)
);

// 4. Product Entity CRUD
router.get('/:productId', (req: Request, res: Response, next: NextFunction) =>
  productController.getProductById(req, res, next)
);
router.patch(
  '/:productId',
  authMiddleware,
  validateBody(ProductUpdateSchema),
  (req: Request, res: Response, next: NextFunction) => productController.updateProduct(req, res, next)
);
router.delete('/:productId', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  productController.deleteProduct(req, res, next)
);

export default router;
