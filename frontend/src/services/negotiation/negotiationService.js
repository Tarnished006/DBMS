import apiClient from '../api/apiClient';

export const negotiationService = {
  // Propose an offer on a farmer's produce listing
  async createOffer(data) {
    const res = await apiClient.post('/api/v1/negotiations', data);
    return res.data;
  },

  // Get offers received by the farmer
  async getFarmerOffers() {
    const res = await apiClient.get('/api/v1/negotiations/farmer');
    return res.data;
  },

  // Get offers sent by the buyer
  async getBuyerOffers() {
    const res = await apiClient.get('/api/v1/negotiations/buyer');
    return res.data;
  },

  // Farmer sends a counter-offer
  async counterOffer(negotiationId, counterPrice, farmerNotes) {
    const res = await apiClient.patch(`/api/v1/negotiations/${negotiationId}/counter`, {
      counterPrice: Number(counterPrice),
      farmerNotes,
    });
    return res.data;
  },

  // Accept pending offer or counter-offer
  async acceptOffer(negotiationId) {
    const res = await apiClient.patch(`/api/v1/negotiations/${negotiationId}/accept`);
    return res.data;
  },

  // Reject offer
  async rejectOffer(negotiationId, notes) {
    const res = await apiClient.patch(`/api/v1/negotiations/${negotiationId}/reject`, { notes });
    return res.data;
  },
};
