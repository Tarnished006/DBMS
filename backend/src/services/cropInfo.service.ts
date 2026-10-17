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

  private registerCropToMemory(crop: ComprehensiveCropData): void {
    if (!memoryDb.crop_info.some((c) => c.id === crop.id)) {
      memoryDb.crop_info.push({
        id: crop.id,
        crop_name: crop.cropName,
        cropName: crop.cropName,
        scientific_name: crop.scientificName,
        scientificName: crop.scientificName,
        family: crop.family,
        category: crop.category,
        kannada_name: crop.localNames.kannada,
        hindi_name: crop.localNames.hindi,
        localNames: crop.localNames,
        description: crop.description,
        image_url: crop.imageUrl,
        imageUrl: crop.imageUrl,
        optimal_temperature_min: crop.optimalTemperatureMin,
        optimal_temperature_max: crop.optimalTemperatureMax,
        rainfall_min: crop.rainfallMin,
        rainfall_max: crop.rainfallMax,
        soil_type: crop.soilType,
        soil_ph: crop.soilPh,
        water_requirement: crop.waterRequirement,
        growth_duration_days: crop.growthDurationDays,
        sowing_season: crop.sowingSeason,
        harvest_season: crop.harvestSeason,
        growing_duration: `${crop.growthDurationDays} Days`,
        temperature_requirements: `${crop.optimalTemperatureMin}°C - ${crop.optimalTemperatureMax}°C`,
        water_requirements: crop.waterRequirement,
        soil_requirements: crop.soilType,
        growth_stages: crop.growthStages,
        mandi_commodity: crop.mandiCommodity,
        created_date: new Date(),
        last_modified_date: new Date(),
        is_dynamically_discovered: crop.id.startsWith('crop-discovered-'),
      });
    }

    if (!CROP_ENCYCLOPEDIA_DATA.some((c) => c.id === crop.id)) {
      CROP_ENCYCLOPEDIA_DATA.push(crop);
    }
  }

  async getCropById(cropId: string): Promise<CropInfoDto> {
    let row: any = null;
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM crop_info WHERE id = $1', [cropId]);
      if (res.rows.length > 0) row = res.rows[0];
    }
    if (!row) {
      row = memoryDb.crop_info.find((cr) => cr.id === cropId);
    }

    if (!row) {
      // Check if crop exists in curated CROP_ENCYCLOPEDIA_DATA (e.g. newly added crops)
      const inCurated = CROP_ENCYCLOPEDIA_DATA.find((c) => c.id === cropId);
      if (inCurated) {
        this.registerCropToMemory(inCurated);
        return this.enrichCrop(inCurated, true);
      }

      // Try on-demand synthesis from Wikipedia & Gov sources
      const cleanName = cropId.replace(/^crop-discovered-/, '').replace(/^crop-/, '').replace(/-\d+$/, '').replace(/-/g, ' ');
      const discovered = await externalEnrichmentService.discoverAndSynthesizeCrop(cleanName);
      if (discovered) {
        this.registerCropToMemory(discovered);
        return this.enrichCrop(discovered, true);
      }

      throw new BusinessException('RESOURCE_NOT_FOUND', 'Crop info not found');
    }

    return this.enrichCrop(row, true);
  }

  async searchCrops(query: string, category?: string): Promise<CropInfoDto[]> {
    const q = (query || '').toLowerCase().trim();
    const cat = category && category.toLowerCase() !== 'all' ? category.toLowerCase().trim() : null;

    if (!q && !cat) return this.getAllCrops();

    let results: CropInfoDto[] = [];

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
      results = await Promise.all(res.rows.map((r: any) => this.enrichCrop(r)));
    } else {
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
      results = await Promise.all(list.map((c) => this.enrichCrop(c)));
    }

    // Dynamic Botanical Discovery & Agronomic Synthesis Engine:
    // If 0 crops matched in DB and the user searched for any crop name (>= 2 chars),
    // fetch botanical taxonomy & synthesize comprehensive datasheet on-the-fly!
    if (results.length === 0 && q.length >= 2) {
      const discovered = await externalEnrichmentService.discoverAndSynthesizeCrop(q);
      if (discovered) {
        this.registerCropToMemory(discovered);
        if (isPostgres()) {
          try {
            await db.query(
              `INSERT INTO crop_info (
                id, crop_name, scientific_name, family, category, kannada_name, hindi_name,
                description, image_url, optimal_temperature_min, optimal_temperature_max,
                rainfall_min, rainfall_max, soil_type, soil_ph, water_requirement, growth_duration_days,
                life_cycle, sowing_season, harvest_season, mandi_commodity, created_date, last_modified_date
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW(),NOW())
              ON CONFLICT (id) DO NOTHING`,
              [
                discovered.id, discovered.cropName, discovered.scientificName, discovered.family,
                discovered.category, discovered.localNames.kannada, discovered.localNames.hindi,
                discovered.description, discovered.imageUrl, discovered.optimalTemperatureMin,
                discovered.optimalTemperatureMax, discovered.rainfallMin, discovered.rainfallMax,
                discovered.soilType, discovered.soilPh, discovered.waterRequirement,
                discovered.growthDurationDays, discovered.lifeCycle, discovered.sowingSeason,
                discovered.harvestSeason, discovered.mandiCommodity,
              ]
            );
          } catch {}
        }
        const enriched = await this.enrichCrop(discovered, false);
        return [enriched];
      }
    }

    return results;
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
    if (row.lifecycleStages && row.pestAndDiseases) {
      return row as ComprehensiveCropData;
    }
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
      isDynamicallyDiscovered: Boolean(row.is_dynamically_discovered || matched?.id?.startsWith('crop-discovered-') || row.id?.startsWith('crop-discovered-')),
    };

  }
}

export const cropInfoService = new CropInfoService();
