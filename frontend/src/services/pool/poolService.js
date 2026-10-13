import apiClient from '../api/apiClient';

export const poolService = {
  // Get consolidated village produce lots with freight savings
  async getPools(params = {}) {
    const res = await apiClient.get('/api/v1/pools', { params });
    return res.data;
  },
};
