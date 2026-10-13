import { Router } from 'express';
import { locationController } from '../controllers/location.controller.js';

const router = Router();

router.get('/states', (req, res, next) => locationController.getStates(req, res, next));
router.get('/states/:stateId/districts', (req, res, next) =>
  locationController.getDistricts(req, res, next)
);
router.get('/districts/:districtId/taluks', (req, res, next) =>
  locationController.getTaluks(req, res, next)
);
router.post('/search', (req, res, next) => locationController.search(req, res, next));
router.get('/geocode', (req, res, next) => locationController.geocode(req, res, next));
router.get('/reverse-geocode', (req, res, next) => locationController.reverseGeocode(req, res, next));

export default router;
