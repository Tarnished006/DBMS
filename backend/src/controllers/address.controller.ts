import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { addressService } from '../services/address.service.js';

export class AddressController {
  async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await addressService.getUserAddresses(req.user!.id);
      res.json(addresses);
    } catch (err) {
      next(err);
    }
  }

  async getAddressById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.getAddressById(req.user!.id, req.params.addressId);
      res.json(address);
    } catch (err) {
      next(err);
    }
  }

  async createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.createAddress(req.user!.id, req.body);
      res.status(201).json(address);
    } catch (err) {
      next(err);
    }
  }

  async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.updateAddress(req.user!.id, req.params.addressId, req.body);
      res.json(address);
    } catch (err) {
      next(err);
    }
  }

  async setDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await addressService.setDefaultAddress(req.user!.id, req.params.addressId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await addressService.deleteAddress(req.user!.id, req.params.addressId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export const addressController = new AddressController();
