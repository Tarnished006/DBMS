import { Router } from 'express';
import { addressController } from '../controllers/address.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { AddressCreateSchema, AddressUpdateSchema } from '../utils/validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => addressController.getAddresses(req, res, next));
router.post('/', validateBody(AddressCreateSchema), (req, res, next) =>
  addressController.createAddress(req, res, next)
);
router.get('/:addressId', (req, res, next) => addressController.getAddressById(req, res, next));
router.patch('/:addressId', validateBody(AddressUpdateSchema), (req, res, next) =>
  addressController.updateAddress(req, res, next)
);
router.patch('/:addressId/default', (req, res, next) =>
  addressController.setDefaultAddress(req, res, next)
);
router.delete('/:addressId', (req, res, next) => addressController.deleteAddress(req, res, next));

export default router;
