import { Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weather.service.js';

export class WeatherController {
  async getDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.latitude as string) || 12.9716;
      const lon = parseFloat(req.query.longitude as string) || 77.5946;
      const weather = await weatherService.getDailyWeather(lat, lon);
      res.json(weather);
    } catch (err) {
      next(err);
    }
  }

  async getHourly(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.latitude as string) || 12.9716;
      const lon = parseFloat(req.query.longitude as string) || 77.5946;
      const weather = await weatherService.getHourlyWeather(lat, lon);
      res.json(weather);
    } catch (err) {
      next(err);
    }
  }

  async getRiskDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.latitude as string) || 12.9716;
      const lon = parseFloat(req.query.longitude as string) || 77.5946;
      const risk = await weatherService.getDailyRisk(lat, lon);
      res.json(risk);
    } catch (err) {
      next(err);
    }
  }

  async getRiskWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.latitude as string) || 12.9716;
      const lon = parseFloat(req.query.longitude as string) || 77.5946;
      const risks = await weatherService.getWeeklyRisk(lat, lon);
      res.json(risks);
    } catch (err) {
      next(err);
    }
  }
}

export const weatherController = new WeatherController();
