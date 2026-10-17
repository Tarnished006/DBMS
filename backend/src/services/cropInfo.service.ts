import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { CropInfoDto } from '../types/index.js';
import { CROP_ENCYCLOPEDIA_DATA, ComprehensiveCropData } from '../data/cropEncyclopediaData.js';
import { externalEnrichmentService } from './externalEnrichment.service.js';

export class CropInfoService {
  async getAllCrops(category?: string): Promise<CropInfoDto[]> {
    const cat = category && category.toLowerCase() !== 'all' ? category.toLowerCase().trim() : null;

    if (isPostgres()) {
      let query = 'SELECT * FROM crop_info';
      const params: any[] = [];
      if (cat) {
        query += ' WHERE LOWER(category) LIKE $1';
        params.push(`%${cat}%`);
      }
      query += ' ORDER BY crop_name ASC';
      const res = await db.query(query, params);
      return Promise.all(res.rows.map((r: any) => this.enrichCrop(r)));
    }

    let list = memoryDb.crop_info;
    if (cat) {
      list = list.filter((c) => c.category?.toLowerCase().includes(cat));
    }
    return Promise.all(list.map((c) => this.enrichCrop(c)));
  }

  async getCropById(cropId: string): Promise<CropInfoDto> {
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM crop_info WHERE id = $1', [cropId]);
      if (res.rows.length === 0) throw new BusinessException('RESOURCE_NOT_FOUND', 'Crop info not found');
      return this.enrichCrop(res.rows[0], true);
    }
    const c = memoryDb.crop_info.find((cr) => cr.id === cropId);
    if (!c) throw new BusinessException('RESOURCE_NOT_FOUND', 'Crop info not found');
    return this.enrichCrop(c, true);
  }

  async searchCrops(query: string, category?: string): Promise<CropInfoDto[]> {
    const q = (query || '').toLowerCase().trim();
    const cat = category && category.toLowerCase() !== 'all' ? category.toLowerCase().trim() : null;

    if (!q && !cat) return this.getAllCrops();

    if (isPostgres()) {
      const conditions: string[] = [];
      const params: any[] = [];
      let pIdx = 1;

      if (q) {
        conditions.push(`(LOWER(crop_name) LIKE $${pIdx} OR LOWER(scientific_name) LIKE $${pIdx} OR LOWER(description) LIKE $${pIdx} OR LOWER(kannada_name) LIKE $${pIdx})`);
        params.push(`%${q}%`);
        pIdx++;
      }
      if (cat) {
        conditions.push(`LOWER(category) LIKE $${pIdx}`);
        params.push(`%${cat}%`);
        pIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const res = await db.query(`SELECT * FROM crop_info ${whereClause} ORDER BY crop_name ASC`, params);
      return Promise.all(res.rows.map((r: any) => this.enrichCrop(r)));
    }

    const list = memoryDb.crop_info.filter((c) => {
      const matchesQ =
        !q ||
        c.crop_name.toLowerCase().includes(q) ||
        c.scientific_name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.kannada_name?.toLowerCase().includes(q) ||
        c.localNames?.kannada?.toLowerCase().includes(q);
      const matchesCat = !cat || c.category?.toLowerCase().includes(cat);
      return matchesQ && matchesCat;
    });

    return Promise.all(list.map((c) => this.enrichCrop(c)));
  }

  async getCategories(): Promise<{ name: string; count: number }[]> {
    const crops = await this.getAllCrops();
    const map = new Map<string, number>();
    for (const c of crops) {
      const cat = c.category || 'Agricultural Produce';
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }

  private findMatchingCuratedCrop(row: any): ComprehensiveCropData | undefined {
    return CROP_ENCYCLOPEDIA_DATA.find(
      (c) =>
        c.id === row.id ||
        c.cropName.toLowerCase() === (row.crop_name || row.cropName || '').toLowerCase() ||
        (row.scientific_name && c.scientificName.toLowerCase() === row.scientific_name.toLowerCase()) ||
        c.cropName.toLowerCase().includes((row.crop_name || '').toLowerCase().split(' ')[0])
    );
  }

  private async getLiveMandiPrice(commodityName?: string): Promise<{ modalPrice: number; market: string; state: string } | null> {
    if (!commodityName) return null;
    const lower = commodityName.toLowerCase();

    if (isPostgres()) {
      try {
        const res = await db.query(
          `SELECT mp.modal_price, m.name as market_name, s.name as state_name
           FROM market_prices mp
           JOIN commodities c ON c.id = mp.commodity_id
           JOIN markets m ON m.id = mp.market_id
           LEFT JOIN taluks t ON t.id = m.taluk_id
           LEFT JOIN districts d ON d.id = t.district_id OR d.id = m.district_id
           LEFT JOIN states s ON s.id = d.state_id
           WHERE LOWER(c.name) LIKE $1
           ORDER BY mp.price_date DESC LIMIT 1`,
          [`%${lower}%`]
        );
        if (res.rows.length > 0) {
          return {
            modalPrice: parseFloat(res.rows[0].modal_price),
            market: res.rows[0].market_name,
            state: res.rows[0].state_name || 'Karnataka',
          };
        }
      } catch {}
    }

    const price = memoryDb.market_prices.find((p) => {
      const c = memoryDb.commodities.find((cm) => cm.id === p.commodity_id);
      return c?.name?.toLowerCase().includes(lower);
    });

    if (price) {
      const m = memoryDb.markets.find((mk) => mk.id === price.market_id);
      const d = m?.district_id ? memoryDb.districts.find((dt) => dt.id === m.district_id) : null;
      const s = d?.state_id ? memoryDb.states.find((st) => st.id === d.state_id) : null;
      return {
        modalPrice: price.modal_price || price.modalPrice,
        market: m?.name || 'APMC Mandi Hub',
        state: s?.name || 'Karnataka',
      };
    }

    return null;
  }

  private async getActiveMarketplaceListingsCount(cropName: string): Promise<number> {
    const clean = cropName.split('(')[0].trim().toLowerCase();
    if (isPostgres()) {
      try {
        const res = await db.query(
          `SELECT COUNT(*) FROM products WHERE LOWER(name) LIKE $1 AND status = 'ACTIVE'`,
          [`%${clean}%`]
        );
        return parseInt(res.rows[0].count, 10);
      } catch {}
    }
    return memoryDb.products.filter(
      (p) => p.status === 'ACTIVE' && p.name.toLowerCase().includes(clean)
    ).length;
  }

  private async enrichCrop(row: any, fullDetail = false): Promise<CropInfoDto> {
    const matched = this.findMatchingCuratedCrop(row);

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

    const cropName = row.crop_name || row.cropName || matched?.cropName || 'Crop';
    const scientificName = row.scientific_name || row.scientificName || matched?.scientificName;
    const category = row.category || matched?.category || 'Agricultural Produce';
    const mandiCommodity = row.mandi_commodity || matched?.mandiCommodity || cropName.split('(')[0].trim();

    // Live Mandi price & marketplace listings count
    const [liveMandi, activeListingsCount, wikiBotanical] = await Promise.all([
      this.getLiveMandiPrice(mandiCommodity),
      this.getActiveMarketplaceListingsCount(cropName),
      fullDetail ? externalEnrichmentService.getWikiSummary(scientificName || cropName) : Promise.resolve(null),
    ]);

    const govAdvisoryLinks = externalEnrichmentService.getGovAdvisories(cropName, category);

    return {
      id: row.id || matched?.id,
      cropName,
      scientificName,
      family: row.family || matched?.family || 'Fabaceae',
      category,
      description: row.description || matched?.description,
      imageUrl: row.image_url || row.imageUrl || matched?.imageUrl,
      localNames: matched?.localNames || {
        kannada: row.kannada_name || 'ಬೆಳೆ',
        hindi: row.hindi_name || 'फसल',
        english: cropName,
      },
      botanicalInfo: matched?.botanicalInfo || {
        family: row.family || 'Poaceae',
        genus: (scientificName || '').split(' ')[0] || 'Plantae',
        origin: 'India',
        plantType: 'Agricultural Crop',
      },
      optimalTemperatureMin: row.optimal_temperature_min ? parseFloat(row.optimal_temperature_min) : (matched?.optimalTemperatureMin ?? 20),
      optimalTemperatureMax: row.optimal_temperature_max ? parseFloat(row.optimal_temperature_max) : (matched?.optimalTemperatureMax ?? 35),
      rainfallMin: row.rainfall_min ? parseFloat(row.rainfall_min) : (matched?.rainfallMin ?? 500),
      rainfallMax: row.rainfall_max ? parseFloat(row.rainfall_max) : (matched?.rainfallMax ?? 1200),
      soilType: row.soil_type || matched?.soilType || 'Well-drained Fertile Loam',
      soilPh: row.soil_ph || matched?.soilPh || '6.0 - 7.5',
      waterRequirement: row.water_requirement || row.water_requirements || matched?.waterRequirement || 'Moderate',
      growthDurationDays: row.growth_duration_days || matched?.growthDurationDays || 120,
      lifeCycle: row.life_cycle || matched?.lifeCycle || 'ANNUAL',
      harvestSeason: row.harvest_season || row.harvesting_info || matched?.harvestSeason || 'Kharif / Rabi',
      sowingSeason: row.sowing_season || row.sowing_info || matched?.sowingSeason || 'Monsoon Season',
      growingDuration: row.growing_duration || `${matched?.growthDurationDays || row.growth_duration_days || 120} Days`,
      temperatureRequirements: row.temperature_requirements || `${matched?.optimalTemperatureMin ?? 20}°C - ${matched?.optimalTemperatureMax ?? 35}°C`,
      growthStages: row.growth_stages || matched?.growthStages || 'Germination → Vegetative → Flowering → Maturity',
      lifecycleStages: matched?.lifecycleStages || [],
      pestAndDiseases: matched?.pestAndDiseases || [],
      nutrientSchedule: matched?.nutrientSchedule || {
        npkRatio: '100:50:50 kg/ha',
        basalDose: 'Apply 50% N + 100% P + 50% K with farmyard manure.',
        vegetativeStage: 'Top dress 25% Nitrogen at active tillering.',
        floweringStage: 'Top dress 25% Nitrogen at flower initiation.',
        micronutrients: 'Zinc Sulphate @ 15 kg/ha if deficient.',
      },
      climateAndSoil: matched?.climateAndSoil || {
        idealPh: row.soil_ph || '6.0 - 7.5',
        soilTypes: [row.soil_type || 'Well-drained Loam'],
        optimalTemp: `${matched?.optimalTemperatureMin ?? 20}°C - ${matched?.optimalTemperatureMax ?? 35}°C`,
        annualRainfall: `${matched?.rainfallMin ?? 500} - ${matched?.rainfallMax ?? 1200} mm`,
        sunRequirement: 'Full Sunlight (6–8 hours daily)',
      },
      harvestingAndPostHarvest: matched?.harvestingAndPostHarvest || {
        maturityIndicators: row.harvesting_info || 'Harvest when 85% of crop turns yellow/ripe.',
        harvestingMethod: 'Manual sickle harvesting or combine.',
        postHarvestManagement: 'Sun dry on clean tarpaulins before storage.',
        yieldPerAcre: '15 - 25 Quintals/acre',
        storageConditions: 'Cool, well-aerated rodent-proof storage.',
      },
      commonDiseases: commonDiseases.length > 0 ? commonDiseases : (matched?.commonDiseases || ['Leaf Spot', 'Blight']),
      uses: uses.length > 0 ? uses : (matched?.uses || ['Human food consumption', 'Livestock animal feed']),
      liveMandiPrice: liveMandi,
      activeMarketplaceListingsCount: activeListingsCount,
      govAdvisoryLinks,
      wikiBotanical,
    };
  }
}

export const cropInfoService = new CropInfoService();
