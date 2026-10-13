import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/location.service.js';

export class LocationController {
  async getStates(_req: Request, res: Response, next: NextFunction) {
    try {
      const states = await locationService.getStates();
      res.json(states);
    } catch (err) {
      next(err);
    }
  }

  async getDistricts(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const districts = await locationService.getDistrictsByState(req.params.stateId);
      res.json(districts);
    } catch (err) {
      next(err);
    }
  }

  async getTaluks(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const taluks = await locationService.getTaluksByDistrict(req.params.districtId);
      res.json(taluks);
    } catch (err) {
      next(err);
    }
  }

  async search(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const query = (req.body?.query || req.query?.query || '') as string;
      const results = await locationService.searchLocations(query);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }

  async geocode(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const address = (req.query.address || '') as string;
      const result = await locationService.geocode(address);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async reverseGeocode(req: Request<any>, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const result = await locationService.reverseGeocode(lat, lon);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const locationController = new LocationController();
