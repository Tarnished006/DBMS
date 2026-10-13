import axios from 'axios';
import apiClient from '../api/apiClient';
import { getPanIndiaMandiPrices, stateMatches } from '@/data/panIndiaMandiData';

const DATA_GOV_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_URL = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`;

function mapStateToGovApi(state) {
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

function normalizeCommodity(name) {
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

/**
 * Direct client-side fetcher for data.gov.in (Agmarknet) Mandi Prices.
 * Calling from the user's browser in India avoids overseas cloud datacenter firewall IP blocks.
 */
async function fetchDirectFromDataGov(params = {}) {
  const apiKey = import.meta.env.VITE_DATA_GOV_API_KEY || '';
  if (!apiKey) {
    return [];
  }
  const query = {
    'api-key': apiKey,
    format: 'json',
    limit: 150,
    offset: 0,
  };

  const state = params.state?.trim();
  if (state && state.toLowerCase() !== 'all') {
    query['filters[state]'] = mapStateToGovApi(state);
  }

  const district = params.district?.trim();
  if (district && district.toLowerCase() !== 'all') {
    query['filters[district]'] = district;
  }

  const normalizedCmd = normalizeCommodity(params.commodity);
  if (normalizedCmd) {
    query['filters[commodity]'] = normalizedCmd;
  }

  const market = params.market?.trim();
  if (market && market.toLowerCase() !== 'all') {
    query['filters[market]'] = market;
  }

  let dateFilterUsed = false;
  if (params.date) {
    if (params.date.includes('-')) {
      const [y, m, d] = params.date.split('-');
      if (y && m && d) {
        query['filters[arrival_date]'] = `${d}/${m}/${y}`;
        dateFilterUsed = true;
      }
    } else if (params.date.includes('/')) {
      query['filters[arrival_date]'] = params.date;
      dateFilterUsed = true;
    }
  }

  let records = [];
  try {
    const res = await axios.get(DATA_GOV_URL, {
      params: query,
      timeout: 7000,
      headers: {
        Accept: 'application/json',
      },
    });
    const raw = res.data?.records || [];
    records = state && state.toLowerCase() !== 'all'
      ? raw.filter((r) => stateMatches(r.state, state))
      : raw;
  } catch (err) {
    console.warn('[MarketPriceService] Direct data.gov.in call notice:', err?.message);
  }

  // If filtered by date but returned 0 records, retry once without arrival_date filter
  // to ensure users get the latest market rates instead of a blank screen
  if (records.length === 0 && dateFilterUsed) {
    const retryQuery = { ...query };
    delete retryQuery['filters[arrival_date]'];
    try {
      const retryRes = await axios.get(DATA_GOV_URL, {
        params: retryQuery,
        timeout: 7000,
        headers: {
          Accept: 'application/json',
        },
      });
      const raw = retryRes.data?.records || [];
      records = state && state.toLowerCase() !== 'all'
        ? raw.filter((r) => stateMatches(r.state, state))
        : raw;
    } catch (retryErr) {
      console.warn('[MarketPriceService] Retry without date filter notice:', retryErr?.message);
    }
  }

  // If filtered by district but returned 0 records, retry without district filter to get state mandis
  if (records.length === 0 && query['filters[district]']) {
    const retryQueryNoDist = { ...query };
    delete retryQueryNoDist['filters[district]'];
    delete retryQueryNoDist['filters[arrival_date]'];
    try {
      const retryRes = await axios.get(DATA_GOV_URL, {
        params: retryQueryNoDist,
        timeout: 7000,
        headers: {
          Accept: 'application/json',
        },
      });
      const raw = retryRes.data?.records || [];
      records = state && state.toLowerCase() !== 'all'
        ? raw.filter((r) => stateMatches(r.state, state))
        : raw;
    } catch (distErr) {
      // notice
    }
  }

  // If state was requested and still returned 0, try alternative aliases (e.g. Orissa, Uttaranchal, Delhi)
  if (records.length === 0 && state && state.toLowerCase() !== 'all') {
    const alternates = [];
    const lower = state.toLowerCase();
    if (lower === 'odisha') alternates.push('Orissa');
    if (lower === 'uttarakhand') alternates.push('Uttaranchal');
    if (lower === 'kerala') alternates.push('Kerala');
    if (lower === 'delhi') alternates.push('Delhi');

    for (const alt of alternates) {
      const altQuery = { ...query, 'filters[state]': alt };
      delete altQuery['filters[arrival_date]'];
      delete altQuery['filters[district]'];
      try {
        const altRes = await axios.get(DATA_GOV_URL, {
          params: altQuery,
          timeout: 7000,
          headers: { Accept: 'application/json' },
        });
        const altRaw = altRes.data?.records || [];
        const altRecs = altRaw.filter((r) => stateMatches(r.state, state));
        if (altRecs.length > 0) {
          records = altRecs;
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

  return records.map((item, idx) => {
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
      source: 'data.gov.in (Agmarknet Live)',
    };
  });
}

export const marketPriceService = {
  // Get current market prices with optional filters (Direct live fetch with backend & pan-India fallback)
  async getMarketPrices(params = {}) {
    // 1. Try direct live fetch from Government of India Agmarknet Mandi API
    try {
      const livePrices = await fetchDirectFromDataGov(params);
      if (livePrices && livePrices.length > 0) {
        return {
          message: 'Live market prices retrieved successfully',
          prices: livePrices,
          source: 'Live data.gov.in (Agmarknet)',
        };
      }
    } catch (directErr) {
      console.warn('[MarketPriceService] Direct live API failed, falling back to backend:', directErr?.message);
    }

    // 2. High availability fallback: backend API & local database
    try {
      const cleanParams = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      }
      const response = await apiClient.get('/api/v1/market-prices', { params: cleanParams });
      const bPrices = response.data?.prices || (Array.isArray(response.data) ? response.data : []);
      if (bPrices && bPrices.length > 0) {
        return response.data;
      }
    } catch (backendErr) {
      console.warn('[MarketPriceService] Backend API notice, using pan-India catalog:', backendErr?.message);
    }

    // 3. Resilient pan-India fallback: Guaranteed authentic mandis by state & district
    const fallbackPrices = getPanIndiaMandiPrices({
      state: params.state,
      district: params.district,
      market: params.market,
      commodity: params.commodity,
      date: params.date,
    });

    return {
      message: 'Market prices retrieved successfully',
      prices: fallbackPrices,
      source: 'National APMC Mandi Registry',
    };
  },

  // Get historical market price trend for a commodity
  async getHistoricalPrices({ commodity, state, district, market, fromDate, toDate }) {
    const today = new Date();
    const defaultToDate = today.toISOString().split('T')[0];
    const defaultFromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const cleanParams = {
      commodity: commodity || 'Tomato',
      fromDate: fromDate || defaultFromDate,
      toDate: toDate || defaultToDate,
    };

    if (state) cleanParams.state = state;
    if (district) cleanParams.district = district;
    if (market) cleanParams.market = market;

    const response = await apiClient.get('/api/v1/market-prices/history', {
      params: cleanParams,
    });
    return response.data;
  },
};

