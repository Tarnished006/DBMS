import axios from 'axios';
import apiClient from '../api/apiClient';

const DATA_GOV_API_KEY = '579b464db66ec23bdd000001545f657fd0f648fd743841900f2cf198';
const DATA_GOV_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Direct client-side fetcher for data.gov.in (Agmarknet) Mandi Prices.
 * Calling from the user's browser in India avoids overseas cloud datacenter firewall IP blocks.
 */
async function fetchDirectFromDataGov(params = {}) {
  const query = {
    'api-key': DATA_GOV_API_KEY,
    format: 'json',
    limit: 150,
    offset: 0,
  };

  const state = params.state?.trim();
  if (state && state.toLowerCase() !== 'all') {
    query['filters[state]'] = state;
  }

  const district = params.district?.trim();
  if (district && district.toLowerCase() !== 'all') {
    query['filters[district]'] = district;
  }

  const commodity = params.commodity?.trim();
  if (commodity && commodity.toLowerCase() !== 'all') {
    query['filters[commodity]'] = commodity;
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
      timeout: 6000,
      headers: {
        Accept: 'application/json',
      },
    });
    records = res.data?.records || [];
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
        timeout: 6000,
        headers: {
          Accept: 'application/json',
        },
      });
      records = retryRes.data?.records || [];
    } catch (retryErr) {
      console.warn('[MarketPriceService] Retry without date filter notice:', retryErr?.message);
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
  // Get current market prices with optional filters (Direct live fetch with backend fallback)
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

    // 2. High availability fallback: backend API & local PostgreSQL database
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }
    const response = await apiClient.get('/api/v1/market-prices', { params: cleanParams });
    return response.data;
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
