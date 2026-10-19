import apiClient from '../api/apiClient';

export const negotiationService = {
  // Propose an offer on a farmer's produce listing
  async createOffer(data) {
    const payload = {
      produceId: data.produceId || data.productId,
      quantity: Number(data.quantity || data.proposedQuantity),
      proposedPrice: Number(data.proposedPrice),
      unit: data.unit || 'KG',
      buyerNotes: data.buyerNotes || data.notes,
    };
    const res = await apiClient.post('/api/v1/negotiations', payload);
    return res.data;
  },

  // Alias for initiateNegotiation to ensure backward and call-site compatibility
  async initiateNegotiation(data) {
    return this.createOffer(data);
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

  // Farmer or Buyer sends a counter-offer
  async counterOffer(negotiationId, counterPrice, notes) {
    const res = await apiClient.patch(`/api/v1/negotiations/${negotiationId}/counter`, {
      counterPrice: Number(counterPrice),
      farmerNotes: notes,
      buyerNotes: notes,
      notes,
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
