import apiClient from '../api/apiClient';

export const cropInfoService = {
  // Get crop summaries with optional category filter
  async getFeaturedCrops(category) {
    const params = category && category !== 'ALL' ? { category } : {};
    const response = await apiClient.get('/api/v1/crops/info', { params });
    return response.data;
  },

  // Search crop info with query and optional category filter
  async searchCrops(query, category) {
    const params = {
      query: query || '',
      ...(category && category !== 'ALL' ? { category } : {}),
    };
    const response = await apiClient.get('/api/v1/crops/info/search', { params });
    return response.data;
  },

  // Get distinct crop categories
  async getCategories() {
    const response = await apiClient.get('/api/v1/crops/info/categories');
    return response.data;
  },

  // Get detailed crop guide by ID with full lifecycle & disease diagnostics
  async getCropDetails(cropId) {
    const response = await apiClient.get(`/api/v1/crops/info/${cropId}`);
    return response.data;
  },
};
