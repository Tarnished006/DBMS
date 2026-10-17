import apiClient from '../api/apiClient';

export const poolService = {
  // Get consolidated village produce lots with freight savings
  async getPools(params = {}) {
    const res = await apiClient.get('/api/v1/pools', { params });
    return res.data;
  },

  // Farmer pledges harvest produce to a village pool
  async pledgeToPool(payload) {
    const res = await apiClient.post('/api/v1/pools/pledge', payload);
    return res.data;
  },

  // Farmer requests / initiates a new community truck route
  async requestRoute(payload) {
    const res = await apiClient.post('/api/v1/pools/request-route', payload);
    return res.data;
  },
};

