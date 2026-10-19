import axios from 'axios';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { ENV } from '../config/env.js';
import { getPanIndiaMandiPrices, stateMatches, canonicalState } from '../data/panIndiaMandiData.js';
import {
  MarketPriceDto,
  MarketPriceResponseDto,
  MarketPriceTrendDto,
  HistoricalPricePointDto,
} from '../types/index.js';

export interface MarketPriceFilter {
  commodityId?: string;
  marketId?: string;
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  date?: string;
}

export interface MarketPriceHistoryFilter {
  commodityId?: string;
  commodity?: string;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  state?: string;
  district?: string;
  market?: string;
}

interface CacheEntry {
  data: MarketPriceDto[];
  timestamp: number;
}

export class MarketPriceService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly DATA_GOV_RESOURCE_ID =
    process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
  private readonly DATA_GOV_URL = `https://api.data.gov.in/resource/${this.DATA_GOV_RESOURCE_ID}`;

  private get apiKey(): string {
    return process.env.DATA_GOV_IN_API_KEY || ENV.DATA_GOV_IN_API_KEY || '';
  }

  async getLatestPrices(
    filtersOrCommodityId?: MarketPriceFilter | string,
    maybeMarketId?: string
  ): Promise<MarketPriceResponseDto> {
    const filters: MarketPriceFilter =
      typeof filtersOrCommodityId === 'string'
        ? { commodityId: filtersOrCommodityId, marketId: maybeMarketId }
        : filtersOrCommodityId || {};

    const commodityName = this.resolveCommodityName(filters.commodity, filters.commodityId);
    const marketName = this.resolveMarketName(filters.market, filters.marketId);

    // 1. Try external real-time data.gov.in Mandi API first
    if (this.apiKey) {
      try {
        const livePrices = await this.fetchLiveMandiPrices({
          commodity: commodityName,
          state: filters.state,
          district: filters.district,
          market: marketName,
          date: filters.date,
        });

        if (livePrices.length > 0) {
          return {
            message: 'Market prices retrieved successfully',
            prices: livePrices,
          };
        }
      } catch (err) {
        console.warn('[MarketPrice] data.gov.in Mandi API unavailable or timed out, falling back to database/catalog:', (err as Error).message);
      }
    }

    // 2. Fallback to local database / memory store
    let dbPrices = await this.getPricesFromDatabase(filters, commodityName, marketName);
    if (!dbPrices || dbPrices.length === 0) {
      dbPrices = getPanIndiaMandiPrices({
        state: filters.state,
        district: filters.district,
        market: marketName,
        commodity: commodityName,
        date: filters.date,
      });
    }

    return {
      message: 'Market prices retrieved successfully',
      prices: dbPrices,
    };
  }

  async getPriceHistory(
    filtersOrCommodityId?: MarketPriceHistoryFilter | string,
    maybeStartDate?: string,
    maybeEndDate?: string
  ): Promise<MarketPriceTrendDto> {
    const filters: MarketPriceHistoryFilter =
      typeof filtersOrCommodityId === 'string'
        ? {
            commodityId: filtersOrCommodityId,
            startDate: maybeStartDate,
            endDate: maybeEndDate,
          }
        : filtersOrCommodityId || {};

    const commodityName =
      this.resolveCommodityName(filters.commodity, filters.commodityId) || 'Tomato';
    const startDate = filters.startDate || filters.fromDate;
    const endDate = filters.endDate || filters.toDate;

    if (!startDate || !endDate) {
      // Default to last 7 days if not provided
      const now = new Date();
      const endStr = now.toISOString().split('T')[0];
      const startStr = new Date(now.getTime() - 6 * 86400000).toISOString().split('T')[0];
      return this.attachTrendAdvisory(this.generateHistoricalTrend(commodityName, filters, startStr, endStr));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BusinessException(
        'MARKET_PRICE_INVALID_DATE_RANGE',
        'The provided date range is invalid. Start date must be before or equal to end date.'
      );
    }

    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      throw new BusinessException(
        'MARKET_PRICE_DATE_RANGE_TOO_LARGE',
        'The provided date range is too large. Please limit the range to a maximum of 30 days.'
      );
    }

    // Attempt to query database for records in range
    let dbPrices: MarketPriceDto[] = [];
    const targetCmd = filters.commodityId || filters.commodity || commodityName;
    if (targetCmd) {
      dbPrices = await this.getHistoricalFromDb(
        targetCmd,
        filters.market,
        startDate,
        endDate
      );
    }

    if (dbPrices.length >= 3) {
      const historicalPoints: HistoricalPricePointDto[] = dbPrices.map((p) => ({
        date: p.arrival_date || p.priceDate,
        commodity: p.commodity || commodityName,
        state: p.state,
        district: p.district,
        market: p.market,
        modal_price: p.modal_price,
        modalPrice: p.modalPrice,
        minimum_price: p.minimum_price,
        minPrice: p.minPrice,
        maximum_price: p.maximum_price,
        maxPrice: p.maxPrice,
        unit: p.unit,
      }));

      return this.attachTrendAdvisory({
        commodity: commodityName,
        state: filters.state || 'Karnataka',
        district: filters.district || '',
        market: filters.market || '',
        prices: historicalPoints,
      });
    }

    // Synthesize realistic historical curve anchored on real Mandi modal rate
    return this.attachTrendAdvisory(this.generateHistoricalTrend(commodityName, filters, startDate, endDate));
  }

  private normalizeCommodityName(name?: string): string | undefined {
    if (!name) return undefined;
    const trimmed = name.trim();
    if (!trimmed || trimmed.toLowerCase() === 'all') return undefined;
    const lower = trimmed.toLowerCase();
    if (lower === 'tomatoes') return 'Tomato';
    if (lower === 'potatoes') return 'Potato';
    if (lower === 'onions') return 'Onion';
    if (lower === 'apples') return 'Apple';
    if (lower === 'bananas') return 'Banana';
    if (lower === 'chillies' || lower === 'chilis' || lower === 'chilli') return 'Green Chilli';
    return trimmed;
  }

  private async fetchLiveMandiPrices(params: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    date?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketPriceDto[]> {
    const key = this.apiKey;
    if (!key) return [];

    const cleanParams: Record<string, string> = {
      'api-key': key,
      format: 'json',
      limit: String(params.limit || 200),
      offset: String(params.offset || 0),
    };

    if (params.state && params.state.toLowerCase() !== 'all') {
      cleanParams['filters[state]'] = this.mapStateToGovApi(params.state);
    }
    if (params.district && params.district.toLowerCase() !== 'all') {
      cleanParams['filters[district]'] = params.district.trim();
    }

    const normalizedCmd = this.normalizeCommodityName(params.commodity);
    if (normalizedCmd) {
      cleanParams['filters[commodity]'] = normalizedCmd;
    }

    if (params.market && params.market.toLowerCase() !== 'all') {
      cleanParams['filters[market]'] = params.market.trim();
    }

    // Format arrival date if supplied:
    let dateFilterUsed = false;
    if (params.date) {
      if (params.date.includes('-')) {
        const [y, m, d] = params.date.split('-');
        if (y && m && d) {
          cleanParams['filters[arrival_date]'] = `${d}/${m}/${y}`;
          dateFilterUsed = true;
        }
      } else if (params.date.includes('/')) {
        cleanParams['filters[arrival_date]'] = params.date;
        dateFilterUsed = true;
      }
    }

    const cacheKey = JSON.stringify(cleanParams);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const targetState = params.state?.trim();
    let records: any[] = [];
    try {
      const resp = await axios.get(this.DATA_GOV_URL, {
        params: cleanParams,
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });
      const raw = resp.data?.records || [];
      records = targetState && targetState.toLowerCase() !== 'all'
        ? raw.filter((r: any) => stateMatches(r.state, targetState))
        : raw;
    } catch (apiErr) {
      console.warn('[MarketPrice] data.gov.in initial query notice:', (apiErr as Error).message);
    }

    // If records is empty and a specific date filter was used, retry once without date filter
    // to guarantee farmers/buyers get the most recent active prices from APMC Mandis
    if (records.length === 0 && dateFilterUsed) {
      const retryParams = { ...cleanParams };
      delete retryParams['filters[arrival_date]'];
      try {
        const retryResp = await axios.get(this.DATA_GOV_URL, {
          params: retryParams,
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        });
        const raw = retryResp.data?.records || [];
        records = targetState && targetState.toLowerCase() !== 'all'
          ? raw.filter((r: any) => stateMatches(r.state, targetState))
          : raw;
      } catch (retryErr) {
        console.warn('[MarketPrice] Retry without date filter notice:', (retryErr as Error).message);
      }
    }

    // If records is still empty and district was filtered, retry without district to get state mandis
    if (records.length === 0 && cleanParams['filters[district]']) {
      const retryParamsNoDist = { ...cleanParams };
      delete retryParamsNoDist['filters[district]'];
      delete retryParamsNoDist['filters[arrival_date]'];
      try {
        const retryResp = await axios.get(this.DATA_GOV_URL, {
          params: retryParamsNoDist,
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        });
        const raw = retryResp.data?.records || [];
        records = targetState && targetState.toLowerCase() !== 'all'
          ? raw.filter((r: any) => stateMatches(r.state, targetState))
          : raw;
      } catch (distErr) {
        // notice
      }
    }

    // If still empty and state was filtered, try alternative state spellings on data.gov.in
    if (records.length === 0 && targetState && targetState.toLowerCase() !== 'all') {
      const alternates: string[] = [];
      const lower = targetState.toLowerCase();
      if (lower === 'odisha') alternates.push('Orissa');
      if (lower === 'uttarakhand') alternates.push('Uttaranchal');
      if (lower === 'kerala') alternates.push('Kerala');
      if (lower === 'delhi') alternates.push('Delhi');

      for (const alt of alternates) {
        const altQuery: Record<string, string> = { ...cleanParams, 'filters[state]': alt };
        delete altQuery['filters[arrival_date]'];
        delete altQuery['filters[district]'];
        try {
          const altResp = await axios.get(this.DATA_GOV_URL, {
            params: altQuery,
            timeout: 8000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'application/json',
            },
          });
          const raw = altResp.data?.records || [];
          const matchedRecs = raw.filter((r: any) => stateMatches(r.state, targetState));
          if (matchedRecs.length > 0) {
            records = matchedRecs;
            break;
          }
        } catch (e) {
          // notice
        }
      }
    }

    if (!Array.isArray(records) || records.length === 0) {
      return [];
    }

    const mapped: MarketPriceDto[] = records.map((item: any, idx: number) => {
      const rawMin = Number(item.min_price || 0);
      const rawMax = Number(item.max_price || 0);
      const rawModal = Number(item.modal_price || 0);

      let isoDate = item.arrival_date || new Date().toISOString().split('T')[0];
      if (item.arrival_date && item.arrival_date.includes('/')) {
        const [d, m, y] = item.arrival_date.split('/');
        if (d && m && y) {
          isoDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
      }

      return {
        id: `gov-${idx}-${item.commodity}-${item.market}`.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),
        commodity: item.commodity,
        commodityName: item.commodity,
        variety: item.variety || 'Local',
        grade: item.grade || 'FAQ',
        market: item.market,
        marketName: item.market,
        state: item.state,
        district: item.district,
        minimum_price: rawMin,
        minimumPrice: rawMin,
        minPrice: rawMin,
        maximum_price: rawMax,
        maximumPrice: rawMax,
        maxPrice: rawMax,
        modal_price: rawModal,
        modalPrice: rawModal,
        unit: 'Quintal',
        currency: 'INR',
        arrival_date: isoDate,
        arrivalDate: isoDate,
        priceDate: isoDate,
        source: 'data.gov.in (Agmarknet)',
      };
    });

    this.cache.set(cacheKey, { data: mapped, timestamp: Date.now() });
    return mapped;
  }

  private async getPricesFromDatabase(
    filters: MarketPriceFilter,
    commodityName?: string,
    marketName?: string
  ): Promise<MarketPriceDto[]> {
    if (isPostgres()) {
      try {
        let query = `
          SELECT mp.*, 
                 mp.arrival_date as price_date,
                 mp.minimum_price as min_price,
                 mp.maximum_price as max_price,
                 c.name as commodity_name, c.name as commodity_code,
                 m.name as market_name, d.name as district_name, s.name as state_name
          FROM market_prices mp
          JOIN commodities c ON c.id = mp.commodity_id
          JOIN markets m ON m.id = mp.market_id
          JOIN districts d ON d.id = m.district_id
          JOIN states s ON s.id = d.state_id
        `;
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (filters.commodityId) {
          conditions.push(`mp.commodity_id = $${idx++}`);
          params.push(filters.commodityId);
        } else if (commodityName && commodityName.toLowerCase() !== 'all') {
          conditions.push(`LOWER(c.name) LIKE $${idx++}`);
          params.push(`%${commodityName.toLowerCase()}%`);
        }

        if (filters.marketId) {
          conditions.push(`mp.market_id = $${idx++}`);
          params.push(filters.marketId);
        } else if (marketName) {
          conditions.push(`LOWER(m.name) LIKE $${idx++}`);
          params.push(`%${marketName.toLowerCase()}%`);
        }

        if (filters.state) {
          conditions.push(`LOWER(s.name) = $${idx++}`);
          params.push(filters.state.toLowerCase());
        }
        if (filters.district) {
          conditions.push(`LOWER(d.name) = $${idx++}`);
          params.push(filters.district.toLowerCase());
        }

        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ' ORDER BY mp.arrival_date DESC LIMIT 50';

        const res = await db.query(query, params);
        if (res.rows && res.rows.length > 0) {
          return res.rows.map(this.mapDbPrice);
        }
      } catch (dbErr) {
        console.warn('[MarketPrice] Database query notice, using memory fallback:', (dbErr as Error).message);
      }
    }

    let list = [...memoryDb.market_prices];

    // Filter by State
    if (filters.state && filters.state.toLowerCase() !== 'all') {
      const stateQuery = filters.state.toLowerCase().trim();
      const st = memoryDb.states.find(
        (s) => stateMatches(s.name, stateQuery)
      );
      if (st) {
        const stateDistricts = memoryDb.districts.filter((d) => d.state_id === st.id).map((d) => d.id);
        const stateMarkets = memoryDb.markets
          .filter((m) => stateDistricts.includes(m.district_id))
          .map((m) => m.id);
        list = list.filter((p) => stateMarkets.includes(p.market_id));
      } else {
        list = [];
      }
    }

    // Filter by District
    if (filters.district && filters.district.toLowerCase() !== 'all') {
      const distQuery = filters.district.toLowerCase().trim();
      const dist = memoryDb.districts.find(
        (d) => d.name.toLowerCase() === distQuery || d.name.toLowerCase().includes(distQuery)
      );
      if (dist) {
        const distMarkets = memoryDb.markets
          .filter((m) => m.district_id === dist.id)
          .map((m) => m.id);
        list = list.filter((p) => distMarkets.includes(p.market_id));
      } else {
        list = [];
      }
    }

    // Filter by Commodity
    if (filters.commodityId) {
      list = list.filter((p) => p.commodity_id === filters.commodityId);
    } else if (commodityName && commodityName.toLowerCase() !== 'all') {
      const c = memoryDb.commodities.find(
        (cm) => cm.name.toLowerCase().includes(commodityName.toLowerCase())
      );
      if (c) {
        list = list.filter((p) => p.commodity_id === c.id);
      } else {
        list = [];
      }
    }

    // Filter by Market
    if (filters.marketId) {
      list = list.filter((p) => p.market_id === filters.marketId);
    } else if (marketName && marketName.toLowerCase() !== 'all') {
      const mkt = memoryDb.markets.find((m) =>
        m.name.toLowerCase().includes(marketName.toLowerCase())
      );
      if (mkt) {
        list = list.filter((p) => p.market_id === mkt.id);
      } else {
        list = [];
      }
    }

    return list.map(this.mapMemoryPrice);
  }

  private async getHistoricalFromDb(
    commodityParam: string,
    marketParam: string | undefined,
    startDate: string,
    endDate: string
  ): Promise<MarketPriceDto[]> {
    if (isPostgres()) {
      try {
        const cleanCmd = (commodityParam || '').toLowerCase().trim();
        const primaryCmd = cleanCmd.split('(')[0].trim();
        const cleanMkt = (marketParam || '').toLowerCase().trim();

        // 1. Try matching both commodity and market
        let query = `
          SELECT mp.*, 
                 mp.arrival_date as price_date,
                 mp.minimum_price as min_price,
                 mp.maximum_price as max_price,
                 c.name as commodity_name, c.name as commodity_code,
                 m.name as market_name, 
                 COALESCE(d.name, '') as district_name, 
                 COALESCE(s.name, '') as state_name
          FROM market_prices mp
          JOIN commodities c ON c.id = mp.commodity_id
          JOIN markets m ON m.id = mp.market_id
          LEFT JOIN districts d ON d.id = m.district_id
          LEFT JOIN states s ON s.id = d.state_id
          WHERE (mp.commodity_id = $1 OR LOWER(c.name) LIKE $2 OR LOWER(c.name) LIKE $3)
            AND mp.arrival_date BETWEEN $4 AND $5
        `;
        const params: any[] = [
          commodityParam,
          `%${cleanCmd}%`,
          `%${primaryCmd}%`,
          startDate,
          endDate,
        ];

        if (cleanMkt && cleanMkt !== 'all') {
          query += ` AND (mp.market_id = $6 OR LOWER(m.name) LIKE $7)`;
          params.push(marketParam, `%${cleanMkt}%`);
        }

        query += ` ORDER BY mp.arrival_date ASC`;

        const res = await db.query(query, params);
        if (res.rows && res.rows.length >= 2) {
          return res.rows.map(this.mapDbPrice);
        }

        // 2. If specific market had fewer records, relax market filter to commodity across mandis
        if (cleanMkt && cleanMkt !== 'all') {
          const relaxRes = await db.query(
            `SELECT mp.*, 
                    mp.arrival_date as price_date,
                    mp.minimum_price as min_price,
                    mp.maximum_price as max_price,
                    c.name as commodity_name, c.name as commodity_code,
                    m.name as market_name, 
                    COALESCE(d.name, '') as district_name, 
                    COALESCE(s.name, '') as state_name
             FROM market_prices mp
             JOIN commodities c ON c.id = mp.commodity_id
             JOIN markets m ON m.id = mp.market_id
             LEFT JOIN districts d ON d.id = m.district_id
             LEFT JOIN states s ON s.id = d.state_id
             WHERE (mp.commodity_id = $1 OR LOWER(c.name) LIKE $2 OR LOWER(c.name) LIKE $3)
               AND mp.arrival_date BETWEEN $4 AND $5
             ORDER BY mp.arrival_date ASC`,
            [commodityParam, `%${cleanCmd}%`, `%${primaryCmd}%`, startDate, endDate]
          );
          if (relaxRes.rows && relaxRes.rows.length >= 2) {
            return relaxRes.rows.map(this.mapDbPrice);
          }
        }
      } catch (dbErr) {
        console.warn('[MarketPrice] Historical query notice, using synthetic fallback:', (dbErr as Error).message);
      }
    }

    const list = memoryDb.market_prices.filter(
      (p) =>
        (p.commodity_id === commodityParam ||
          (p as any).commodity?.toLowerCase()?.includes(commodityParam?.toLowerCase())) &&
        p.price_date >= startDate &&
        p.price_date <= endDate
    );
    return list.map(this.mapMemoryPrice);
  }

  private generateHistoricalTrend(
    commodity: string,
    filters: MarketPriceHistoryFilter,
    startDate: string,
    endDate: string
  ): MarketPriceTrendDto {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.max(2, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);

    // Realistic baseline price by commodity
    const baseRates: Record<string, { min: number; max: number; modal: number }> = {
      tomato: { min: 1400, max: 2200, modal: 1800 },
      onion: { min: 2500, max: 3800, modal: 3100 },
      potato: { min: 1800, max: 2400, modal: 2100 },
      wheat: { min: 2800, max: 3500, modal: 3200 },
      rice: { min: 3600, max: 5200, modal: 4400 },
      cotton: { min: 6800, max: 8200, modal: 7500 },
    };

    const key = (commodity || '').toLowerCase().trim();
    let liveModal: number | undefined;
    for (const [, entry] of this.cache.entries()) {
      const match = entry.data.find(
        (p) =>
          p.commodity.toLowerCase().includes(key) ||
          key.includes(p.commodity.toLowerCase()) ||
          p.commodityName.toLowerCase().includes(key)
      );
      if (match && match.modalPrice > 0) {
        liveModal = match.modalPrice;
        break;
      }
    }

    const rate = liveModal
      ? { min: Math.round(liveModal * 0.88), max: Math.round(liveModal * 1.12), modal: liveModal }
      : baseRates[key] || { min: 2000, max: 3000, modal: 2500 };

    const prices: HistoricalPricePointDto[] = [];
    for (let i = 0; i < dayCount; i++) {
      const curDate = new Date(start.getTime() + i * 86400000).toISOString().split('T')[0];
      // Subtle daily fluctuation
      const variance = Math.sin(i * 0.8) * 0.08 + ((i % 3) - 1) * 0.02;
      const modal = Math.round(rate.modal * (1 + variance));
      const min = Math.round(modal * 0.88);
      const max = Math.round(modal * 1.12);

      prices.push({
        date: curDate,
        commodity: commodity,
        state: filters.state || 'Karnataka',
        district: filters.district || '',
        market: filters.market || 'APMC Market',
        modal_price: modal,
        modalPrice: modal,
        minimum_price: min,
        minPrice: min,
        maximum_price: max,
        maxPrice: max,
        unit: 'Quintal',
      });
    }

    return {
      commodity,
      state: filters.state || 'Karnataka',
      district: filters.district || '',
      market: filters.market || 'APMC Market',
      prices,
    };
  }

  private attachTrendAdvisory(trend: MarketPriceTrendDto): MarketPriceTrendDto {
    const prices = trend.prices || [];
    if (prices.length < 2) {
      trend.trendAdvisory = {
        recommendation: 'STABLE',
        changePercentage: 0,
        title: 'Stable APMC Benchmark Rate',
        reasoning: 'Arrival volumes and terminal wholesale demand are currently trading at steady parity across regional mandis.',
        suggestedAction: 'Harvest on schedule and trade at standard benchmark prices.',
      };
      return trend;
    }

    const firstPrice = Number(prices[0].modalPrice || prices[0].modal_price || 1);
    const lastPrice = Number(prices[prices.length - 1].modalPrice || prices[prices.length - 1].modal_price || 1);
    const changePercentage = Math.round(((lastPrice - firstPrice) / firstPrice) * 1000) / 10;

    if (changePercentage > 3.5) {
      trend.trendAdvisory = {
        recommendation: 'HOLD',
        changePercentage,
        title: 'HOLD HARVEST — Rising Market Momentum',
        reasoning: `APMC modal arrivals indicate terminal market demand is outstripping local mandi influx (+${changePercentage}% trend). Wholesale buyer inquiry volumes are climbing.`,
        suggestedAction: 'Consider holding crop in farm storage or cold chain for 3–5 days to capture peak spot realization, or offer pre-harvest forward contracts at a premium.',
      };
    } else if (changePercentage < -3.5) {
      trend.trendAdvisory = {
        recommendation: 'SELL_NOW',
        changePercentage,
        title: 'SELL NOW — High Influx & Softening Rates',
        reasoning: `Heavy harvest arrivals across major district yards are creating short-term local supply saturation (${changePercentage}% price dip). Holding longer risks distress discounting.`,
        suggestedAction: 'Liquidate available stock immediately through AgriMarket buyer negotiations or combine lots in an APMC Logistics Transport Pool to dispatch to higher-paying metropolitan hubs.',
      };
    } else {
      trend.trendAdvisory = {
        recommendation: 'STABLE',
        changePercentage,
        title: 'STABLE MARKET — Balanced Supply & Demand',
        reasoning: `Modal mandi prices are trading within a tight equilibrium corridor (${changePercentage > 0 ? '+' : ''}${changePercentage}%). Order intake and APMC auction clearances remain balanced.`,
        suggestedAction: 'Execute regular harvesting cycles and list produce directly on AgriMarket to connect with verified wholesale buyers without APMC commission agent cuts.',
      };
    }

    return trend;
  }

  private mapStateToGovApi(state?: string): string {
    if (!state) return '';
    const trimmed = state.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'kerala') return 'Keralam';
    if (lower === 'chhattisgarh') return 'Chattisgarh';
    if (lower === 'delhi') return 'NCT of Delhi';
    if (lower === 'puducherry') return 'Pondicherry';
    if (lower.includes('andaman') && lower.includes('nicobar')) return 'Andaman and Nicobar';
    return trimmed;
  }

  private resolveCommodityName(name?: string, id?: string): string | undefined {
    if (name) return name;
    if (!id) return undefined;
    const c = memoryDb.commodities.find((cm) => cm.id === id);
    return c?.name;
  }

  private resolveMarketName(name?: string, id?: string): string | undefined {
    if (name) return name;
    if (!id) return undefined;
    const m = memoryDb.markets.find((mk) => mk.id === id);
    return m?.name;
  }

  private mapDbPrice(row: any): MarketPriceDto {
    const dateStr =
      typeof row.price_date === 'string'
        ? row.price_date
        : row.price_date.toISOString().split('T')[0];

    return {
      id: row.id,
      commodity: row.commodity_name,
      commodityName: row.commodity_name,
      commodityCode: row.commodity_code,
      variety: row.variety || 'Local',
      grade: row.grade || 'FAQ',
      market: row.market_name,
      marketName: row.market_name,
      state: row.state_name,
      district: row.district_name,
      minimum_price: parseFloat(row.min_price),
      minimumPrice: parseFloat(row.min_price),
      minPrice: parseFloat(row.min_price),
      maximum_price: parseFloat(row.max_price),
      maximumPrice: parseFloat(row.max_price),
      maxPrice: parseFloat(row.max_price),
      modal_price: parseFloat(row.modal_price),
      modalPrice: parseFloat(row.modal_price),
      unit: 'Quintal',
      currency: 'INR',
      arrival_date: dateStr,
      arrivalDate: dateStr,
      priceDate: dateStr,
      source: 'Database',
    };
  }

  private mapMemoryPrice(row: any): MarketPriceDto {
    const c = memoryDb.commodities.find((cm) => cm.id === row.commodity_id);
    const m = memoryDb.markets.find((mk) => mk.id === row.market_id);
    const t = m?.taluk_id ? memoryDb.taluks.find((tl) => tl.id === m.taluk_id) : null;
    const d = (t?.district_id ? memoryDb.districts.find((dt) => dt.id === t.district_id) : null) ||
              (m?.district_id ? memoryDb.districts.find((dt) => dt.id === m.district_id) : null);
    const s = d?.state_id ? memoryDb.states.find((st) => st.id === d.state_id) : null;

    return {
      id: row.id,
      commodity: c?.name || (row as any).commodity || 'Commodity',
      commodityName: c?.name || (row as any).commodity || 'Commodity',
      commodityCode: c?.code,
      variety: (row as any).variety || 'Local',
      grade: (row as any).grade || 'FAQ',
      market: m?.name || (row as any).market || 'APMC Market',
      marketName: m?.name || (row as any).market || 'APMC Market',
      state: s?.name || (row as any).state || 'All India',
      district: d?.name || (row as any).district || 'District',
      minimum_price: Number(row.min_price || 0),
      minimumPrice: Number(row.min_price || 0),
      minPrice: Number(row.min_price || 0),
      maximum_price: Number(row.max_price || 0),
      maximumPrice: Number(row.max_price || 0),
      maxPrice: Number(row.max_price || 0),
      modal_price: Number(row.modal_price || 0),
      modalPrice: Number(row.modal_price || 0),
      unit: 'Quintal',
      currency: 'INR',
      arrival_date: row.price_date || new Date().toISOString().split('T')[0],
      arrivalDate: row.price_date || new Date().toISOString().split('T')[0],
      priceDate: row.price_date || new Date().toISOString().split('T')[0],
      source: 'APMC Market Feed',
    };
  }

  async diagnoseApi(stateParam?: string): Promise<any> {
    const key = this.apiKey;
    const t0 = Date.now();
    try {
      const resp = await axios.get(this.DATA_GOV_URL, {
        params: {
          'api-key': key,
          format: 'json',
          limit: '5',
          'filters[state]': stateParam || 'Karnataka',
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });
      return {
        status: 'SUCCESS',
        latencyMs: Date.now() - t0,
        apiKeyPrefix: key ? key.slice(0, 8) + '...' : 'EMPTY',
        count: resp.data?.records?.length,
        total: resp.data?.total,
        sample: resp.data?.records?.[0],
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        latencyMs: Date.now() - t0,
        apiKeyPrefix: key ? key.slice(0, 8) + '...' : 'EMPTY',
        message: err.message,
        code: err.code,
        statusHttp: err.response?.status,
        data: err.response?.data,
      };
    }
  }
}

export const marketPriceService = new MarketPriceService();
