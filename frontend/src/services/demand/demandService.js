import apiClient from '../api/apiClient';

export const demandService = {
  // Post a buyer produce demand
  async createDemand(data) {
    const res = await apiClient.post('/api/v1/demands', data);
    return res.data;
  },

  // Get open demands with optional filters
  async getOpenDemands(filters = {}) {
    const res = await apiClient.get('/api/v1/demands', { params: filters });
    return res.data;
  },

  // Get demands posted by current user
  async getMyDemands() {
    const res = await apiClient.get('/api/v1/demands/me');
    return res.data;
  },

  // Get demand details with bids
  async getDemandById(id) {
    const res = await apiClient.get(`/api/v1/demands/${id}`);
    return res.data;
  },

  // Farmer places bid to supply demand
  async placeBid(demandId, bidData) {
    const res = await apiClient.post(`/api/v1/demands/${demandId}/bids`, bidData);
    return res.data;
  },

  // Buyer accepts a farmer's bid
  async acceptBid(demandId, bidId) {
    const res = await apiClient.post(`/api/v1/demands/${demandId}/bids/${bidId}/accept`);
    return res.data;
  },
};
