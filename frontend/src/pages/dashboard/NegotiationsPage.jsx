import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Handshake,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  ShoppingBag,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { negotiationService } from '@/services/negotiation/negotiationService';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

export function NegotiationsPage() {
  const [activeTab, setActiveTab] = useState('farmer'); // 'farmer' | 'buyer'
  const [farmerOffers, setFarmerOffers] = useState([]);
  const [buyerOffers, setBuyerOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const loadOffers = async () => {
    setIsLoading(true);
    try {
      const [fOffers, bOffers] = await Promise.all([
        negotiationService.getFarmerOffers().catch(() => []),
        negotiationService.getBuyerOffers().catch(() => []),
      ]);
      setFarmerOffers(fOffers || []);
      setBuyerOffers(bOffers || []);
    } catch (err) {
      toast.error('Failed to load price negotiations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleAccept = async (id) => {
    try {
      await negotiationService.acceptOffer(id);
      toast.success('Offer accepted! Trade terms locked.');
      loadOffers();
    } catch (err) {
      toast.error(err.message || 'Failed to accept offer.');
    }
  };

  const handleReject = async (id) => {
    try {
      await negotiationService.rejectOffer(id);
      toast.info('Offer rejected.');
      loadOffers();
    } catch (err) {
      toast.error(err.message || 'Failed to reject offer.');
    }
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!counterPrice || Number(counterPrice) <= 0) {
      toast.error('Please enter a valid counter price.');
      return;
    }
    setIsSubmitting(true);
    try {
      await negotiationService.counterOffer(selectedOffer.id, counterPrice, counterNotes);
      toast.success('Counter-offer sent to buyer!');
      setSelectedOffer(null);
      setCounterPrice('');
      setCounterNotes('');
      loadOffers();
    } catch (err) {
      toast.error(err.message || 'Failed to submit counter-offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentList = activeTab === 'farmer' ? farmerOffers : buyerOffers;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>;
      case 'COUNTERED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3.5 h-3.5" /> Counter-Offered</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending Response</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Handshake className="w-7 h-7 text-emerald-600" />
          Direct Price Negotiations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bilateral price negotiation between farmers and buyers. Cut middlemen commission by agreeing directly on volume rates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('farmer')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'farmer'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Received as Farmer ({farmerOffers.length})
        </button>
        <button
          onClick={() => setActiveTab('buyer')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'buyer'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sent as Buyer ({buyerOffers.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="md" text="Loading price negotiations..." />
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active negotiations</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'farmer'
              ? 'When buyers propose custom wholesale pricing on your farm produce, they will appear here.'
              : 'You have not proposed any custom price offers on produce listings yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {currentList.map((item) => {
            const partnerName = activeTab === 'farmer' ? item.buyerName || 'Buyer' : item.farmerName || 'Farmer';
            const rawPhone = activeTab === 'farmer' ? item.buyerPhone || '9876543210' : item.farmerPhone || '9845012345';
            const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '').slice(-10) || '9845012345';
            const dealRate = item.finalPrice || item.counterPrice || item.proposedPrice;
            const waMsg = encodeURIComponent(
              `Namaskara ${partnerName}! Regarding our AgriMarket negotiation for ${item.produceName} (${item.quantity} ${item.unit} at ₹${dealRate}/${item.unit})...`
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft-xs hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-base">{item.produceName}</span>
                    {getStatusBadge(item.status)}
                    <span className="text-xs text-slate-400">• {formatDate(item.createdDate)}</span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                    <span>Quantity: <strong>{item.quantity} {item.unit}</strong></span>
                    <span>Listing Rate: <strong>{formatCurrency(item.producePrice)}/{item.unit}</strong></span>
                    <span className="text-emerald-700 font-bold">
                      Proposed Rate: <strong>{formatCurrency(item.proposedPrice)}/{item.unit}</strong>
                    </span>
                    {item.counterPrice && (
                      <span className="text-blue-700 font-bold">
                        Counter Rate: <strong>{formatCurrency(item.counterPrice)}/{item.unit}</strong>
                      </span>
                    )}
                    {item.finalPrice && (
                      <span className="text-emerald-800 font-black">
                        Final Agreed: <strong>{formatCurrency(item.finalPrice)}/{item.unit}</strong>
                      </span>
                    )}
                  </div>

                  {item.buyerNotes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      Buyer Note: "{item.buyerNotes}"
                    </p>
                  )}
                  {item.farmerNotes && (
                    <p className="text-xs text-blue-600 italic bg-blue-50/50 p-2 rounded-lg">
                      Farmer Note: "{item.farmerNotes}"
                    </p>
                  )}
                </div>

                {/* Action & Quick Connect Buttons */}
                <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                  {/* Direct WhatsApp Quick-Connect */}
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-soft-xs"
                    title={`Chat with ${partnerName} on WhatsApp`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  {/* 1-Click Checkout at Negotiated Bargain Rate for Buyer */}
                  {activeTab === 'buyer' && item.status === 'ACCEPTED' && (
                    <Link
                      to={`/checkout/${item.produceId}?negotiationId=${item.id}&qty=${item.quantity}&price=${dealRate}`}
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-soft-xs"
                        icon={ShoppingBag}
                      >
                        Proceed to Checkout ({formatCurrency(dealRate)}/{item.unit})
                      </Button>
                    </Link>
                  )}

                  {activeTab === 'farmer' && item.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOffer(item)}
                      >
                        Counter Offer
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAccept(item.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => handleReject(item.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {activeTab === 'buyer' && item.status === 'COUNTERED' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAccept(item.id)}
                      >
                        Accept Counter-Rate ({formatCurrency(item.counterPrice)})
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => handleReject(item.id)}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter-Offer Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-soft-xl">
            <h3 className="font-bold text-slate-900 text-lg">Send Counter-Offer</h3>
            <p className="text-xs text-slate-500">
              Buyer proposed <strong>{formatCurrency(selectedOffer.proposedPrice)}/{selectedOffer.unit}</strong> for {selectedOffer.quantity} {selectedOffer.unit}. What is your counter rate?
            </p>

            <form onSubmit={handleCounterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Counter Rate (₹ / {selectedOffer.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Note to Buyer (Optional)
                </label>
                <textarea
                  rows={2}
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="e.g. Rate valid for farm-gate pickup this Thursday"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOffer(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Counter-Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
