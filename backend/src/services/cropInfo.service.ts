import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { CropInfoDto } from '../types/index.js';

export class CropInfoService {
  async getAllCrops(): Promise<CropInfoDto[]> {
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM crop_info ORDER BY crop_name ASC');
      return Promise.all(res.rows.map((r: any) => this.enrichCrop(r)));
    }
    return Promise.all(memoryDb.crop_info.map((c) => this.enrichCrop(c)));
  }

  async getCropById(cropId: string): Promise<CropInfoDto> {
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM crop_info WHERE id = $1', [cropId]);
      if (res.rows.length === 0) throw new BusinessException('RESOURCE_NOT_FOUND', 'Crop info not found');
      return this.enrichCrop(res.rows[0]);
    }
    const c = memoryDb.crop_info.find((cr) => cr.id === cropId);
    if (!c) throw new BusinessException('RESOURCE_NOT_FOUND', 'Crop info not found');
    return this.enrichCrop(c);
  }

  async searchCrops(query: string): Promise<CropInfoDto[]> {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.getAllCrops();

    if (isPostgres()) {
      const res = await db.query(
        `SELECT * FROM crop_info
         WHERE LOWER(crop_name) LIKE $1 OR LOWER(scientific_name) LIKE $1 OR LOWER(description) LIKE $1
         ORDER BY crop_name ASC`,
        [`%${q}%`]
      );
      return Promise.all(res.rows.map((r: any) => this.enrichCrop(r)));
    }

    const list = memoryDb.crop_info.filter(
      (c) =>
        c.crop_name.toLowerCase().includes(q) ||
        c.scientific_name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
    return Promise.all(list.map((c) => this.enrichCrop(c)));
  }

  private async enrichCrop(row: any): Promise<CropInfoDto> {
    let commonDiseases: string[] = [];
    let uses: string[] = [];

    if (isPostgres()) {
      const dRes = await db.query(
        'SELECT disease FROM crop_info_common_diseases WHERE crop_info_id = $1',
        [row.id]
      );
      commonDiseases = dRes.rows.map((d: any) => d.disease);

      const uRes = await db.query(
        'SELECT use_case FROM crop_info_uses WHERE crop_info_id = $1',
        [row.id]
      );
      uses = uRes.rows.map((u: any) => u.use_case);
    } else {
      commonDiseases = (memoryDb.crop_info_common_diseases || [])
        .filter((d) => d.crop_info_id === row.id)
        .map((d) => d.disease);
      uses = (memoryDb.crop_info_uses || [])
        .filter((u) => u.crop_info_id === row.id)
        .map((u) => u.use_case);
    }

    return {
      id: row.id,
      cropName: row.crop_name,
      scientificName: row.scientific_name,
      family: row.family || 'Fabaceae',
      category: row.category || 'Agricultural Produce',
      description: row.description,
      imageUrl: row.image_url,
      optimalTemperatureMin: row.optimal_temperature_min ? parseFloat(row.optimal_temperature_min) : 20,
      optimalTemperatureMax: row.optimal_temperature_max ? parseFloat(row.optimal_temperature_max) : 35,
      rainfallMin: row.rainfall_min ? parseFloat(row.rainfall_min) : 500,
      rainfallMax: row.rainfall_max ? parseFloat(row.rainfall_max) : 1200,
      soilType: row.soil_type || 'Well-drained Fertile Loam',
      waterRequirement: row.water_requirement || row.water_requirements || 'Moderate',
      growthDurationDays: row.growth_duration_days || 120,
      lifeCycle: row.life_cycle || 'ANNUAL',
      harvestSeason: row.harvest_season || 'Kharif / Rabi',
      sowingSeason: row.sowing_season || 'Monsoon Season',
      commonDiseases: commonDiseases.length > 0 ? commonDiseases : (row.diseases || []),
      uses: uses.length > 0 ? uses : (row.uses || []),
    };
  }
}

export const cropInfoService = new CropInfoService();
