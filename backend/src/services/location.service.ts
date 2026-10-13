import axios from 'axios';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { ENV } from '../config/env.js';

export class LocationService {
  async getStates() {
    if (isPostgres()) {
      const res = await db.query('SELECT id, name, code FROM states ORDER BY name ASC');
      return res.rows;
    }
    return memoryDb.states.map((s) => ({ id: s.id, name: s.name, code: s.code }));
  }

  async getDistrictsByState(stateId: string) {
    if (isPostgres()) {
      const res = await db.query(
        'SELECT id, name, code, state_id FROM districts WHERE state_id = $1 ORDER BY name ASC',
        [stateId]
      );
      return res.rows;
    }
    return memoryDb.districts
      .filter((d) => d.state_id === stateId)
      .map((d) => ({ id: d.id, name: d.name, code: d.code, state_id: d.state_id }));
  }

  async getTaluksByDistrict(districtId: string) {
    if (isPostgres()) {
      const res = await db.query(
        'SELECT id, name, district_id FROM taluks WHERE district_id = $1 ORDER BY name ASC',
        [districtId]
      );
      return res.rows;
    }
    return memoryDb.taluks
      .filter((t) => t.district_id === districtId)
      .map((t) => ({ id: t.id, name: t.name, district_id: t.district_id }));
  }

  async searchLocations(query: string) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];

    if (isPostgres()) {
      const res = await db.query(
        `SELECT t.id as taluk_id, t.name as taluk, d.id as district_id, d.name as district,
                s.id as state_id, s.name as state
         FROM taluks t
         JOIN districts d ON d.id = t.district_id
         JOIN states s ON s.id = d.state_id
         WHERE LOWER(t.name) LIKE $1 OR LOWER(d.name) LIKE $1 OR LOWER(s.name) LIKE $1
         LIMIT 20`,
        [`%${q}%`]
      );
      return res.rows;
    }

    const results: any[] = [];
    for (const t of memoryDb.taluks) {
      const d = memoryDb.districts.find((dist) => dist.id === t.district_id);
      const s = d ? memoryDb.states.find((state) => state.id === d.state_id) : null;
      if (
        t.name.toLowerCase().includes(q) ||
        (d && d.name.toLowerCase().includes(q)) ||
        (s && s.name.toLowerCase().includes(q))
      ) {
        results.push({
          taluk_id: t.id,
          taluk: t.name,
          district_id: d?.id,
          district: d?.name,
          state_id: s?.id,
          state: s?.name,
        });
        if (results.length >= 20) break;
      }
    }
    return results;
  }

  async geocode(address: string) {
    if (ENV.GEOAPIFY_API_KEY) {
      try {
        const resp = await axios.get('https://api.geoapify.com/v1/geocode/search', {
          params: {
            text: address,
            apiKey: ENV.GEOAPIFY_API_KEY,
            limit: 1,
          },
        });
        const features = resp.data?.features;
        if (features && features.length > 0) {
          const [lon, lat] = features[0].geometry.coordinates;
          return { latitude: lat, longitude: lon, formatted: features[0].properties?.formatted };
        }
      } catch (err) {
        console.warn('[Geocoding] External API call failed:', err);
      }
    }

    // Default Karnataka centroid fallback
    return {
      latitude: 12.9716,
      longitude: 77.5946,
      formatted: `${address}, Karnataka, India`,
    };
  }

  async reverseGeocode(lat: number, lon: number) {
    if (isNaN(lat) || isNaN(lon)) {
      throw new BusinessException('INVALID_COORDINATES', 'Invalid coordinates provided.');
    }

    if (ENV.GEOAPIFY_API_KEY) {
      try {
        const resp = await axios.get('https://api.geoapify.com/v1/geocode/reverse', {
          params: {
            lat,
            lon,
            apiKey: ENV.GEOAPIFY_API_KEY,
          },
        });
        const properties = resp.data?.features?.[0]?.properties;
        if (properties) {
          return {
            state: properties.state || 'Karnataka',
            district: properties.county || properties.district || 'Bengaluru Urban',
            city: properties.city || properties.village || 'Bengaluru',
            pinCode: properties.postcode || '560001',
            formatted: properties.formatted,
          };
        }
      } catch (err) {
        console.warn('[ReverseGeocoding] External API call failed:', err);
      }
    }

    return {
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      city: 'Bengaluru',
      pinCode: '560001',
      formatted: `Lat: ${lat}, Lon: ${lon}, Karnataka, India`,
    };
  }
}

export const locationService = new LocationService();
