import React, { useState, useEffect } from 'react';
import { Target, Plus, MapPin, Calendar, CheckCircle2, Award, Filter, Search, Send, Lock, UserCheck } from 'lucide-react';
import { demandService } from '@/services/demand/demandService';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export function DemandBoardPage() {
  const [demands, setDemands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedDemandForBid, setSelectedDemandForBid] = useState(null);
  const [selectedDemandForReview, setSelectedDemandForReview] = useState(null);
  const [demandBids, setDemandBids] = useState([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // New Demand Form
  const [newCropName, setNewCropName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('KG');
  const [newPrice, setNewPrice] = useState('');
  const [newGrade, setNewGrade] = useState('GRADE_A');
  const [newDate, setNewDate] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Farmer Bid Form
  const [bidQty, setBidQty] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [bidNotes, setBidNotes] = useState('');

  const { user, userMode } = useAuth();
  const isBuyer = userMode === 'BUYER' || user?.email?.toLowerCase().includes('buyer');
  const isFarmer = !isBuyer; // Default to farmer when userMode === 'FARMER' or user@agrimarket.com
  const toast = useToast();

  const loadDemands = async () => {
    setIsLoading(true);
    try {
      const data = await demandService.getOpenDemands({
        crop: cropFilter || undefined,
        grade: gradeFilter || undefined,
      });
      setDemands(data || []);
    } catch (err) {
      toast.error('Failed to load buyer requirements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDemands();
  }, [cropFilter, gradeFilter]);

  const handlePostDemand = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login as a buyer to post a produce requirement.');
      return;
    }
    if (isFarmer) {
      toast.error('Only registered buyers can post produce requirements. Farmers supply produce directly to open buyer demands.');
      return;
    }
    setIsSubmitting(true);
    try {
      await demandService.createDemand({
        cropName: newCropName,
        quantityNeeded: Number(newQty),
        unit: newUnit,
        targetPricePerUnit: Number(newPrice),
        qualityGrade: newGrade,
        requiredByDate: newDate,
        deliveryCity: newCity,
        description: newDesc,
      });
      toast.success('Produce requirement posted to Demand Board!');
      setShowPostModal(false);
      setNewCropName('');
      setNewQty('');
      setNewPrice('');
      setNewDesc('');
      loadDemands();
    } catch (err) {
      toast.error(err.message || 'Failed to post requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login with your Farmer account to supply produce.');
      return;
    }
    if (isBuyer) {
      toast.error('Only farmers can supply produce or place fulfillment bids. Buyers cannot supply demands.');
      return;
    }
    setIsSubmitting(true);
    try {
      await demandService.placeBid(selectedDemandForBid.id, {
        offeredQuantity: Number(bidQty),
        offeredPricePerUnit: Number(bidPrice),
        notes: bidNotes,
      });
      toast.success('Supply bid submitted to buyer successfully!');
      setSelectedDemandForBid(null);
      setBidQty('');
      setBidPrice('');
      setBidNotes('');
      loadDemands();
    } catch (err) {
      toast.error(err.message || 'Failed to submit bid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenManageBids = async (demand) => {
    setSelectedDemandForReview(demand);
    setIsLoadingBids(true);
    try {
      const details = await demandService.getDemandById(demand.id);
      setDemandBids(details?.bids || []);
    } catch (err) {
      toast.error('Failed to load bids for this requirement.');
      setDemandBids([]);
    } finally {
      setIsLoadingBids(false);
    }
  };

  const handleAcceptBid = async (demandId, bidId) => {
    try {
      await demandService.acceptBid(demandId, bidId);
      toast.success('Farmer supply bid accepted! Trade terms locked & demand fulfilled.');
      setSelectedDemandForReview(null);
      loadDemands();
    } catch (err) {
      toast.error(err.message || 'Failed to accept bid.');
    }
  };

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'GRADE_A':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800"><Award className="w-3 h-3" /> Grade A (Export / Supermarket)</span>;
      case 'GRADE_B':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><Award className="w-3 h-3" /> Grade B (Restaurant / Cooking)</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700"><Award className="w-3 h-3" /> Grade C (Food Processing)</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-200 text-xs font-extrabold uppercase tracking-wider">
            <Target className="w-4 h-4 text-emerald-300" />
            Reverse Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Buyer Demand Board</h1>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Retailers, hotels, and bulk caterers post verified produce requirements. Farmers supply directly at zero middleman commission.
          </p>
        </div>

        {isBuyer ? (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowPostModal(true)}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold self-start md:self-auto shadow-soft-md"
          >
            Post a Requirement
          </Button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 text-xs font-extrabold shadow-sm self-start md:self-auto">
            <span>🚜</span>
            <span>Farmer Mode: Direct Supply & Fulfill</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft-xs flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search crop requirement (e.g. Tomato, Onion)..."
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Quality Grades</option>
            <option value="GRADE_A">Grade A (Premium)</option>
            <option value="GRADE_B">Grade B (Cooking)</option>
            <option value="GRADE_C">Grade C (Processing)</option>
          </select>
        </div>
      </div>

      {/* Demand Cards Grid */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" text="Loading active produce demands..." />
        </div>
      ) : demands.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Target className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No open requirements found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isBuyer
              ? 'Click "Post a Requirement" above to source produce directly from regional farmers.'
              : 'There are currently no active buyer demands. Check back shortly for new contracts.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demands.map((demand) => (
            <div
              key={demand.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft-xs hover:border-emerald-300 hover:shadow-soft-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{demand.cropName}</h3>
                    <p className="text-xs text-slate-500">Posted by {demand.buyerName}</p>
                  </div>
                  {getGradeBadge(demand.qualityGrade)}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Needed Volume</span>
                    <strong className="text-slate-900 font-black text-sm">
                      {demand.quantityNeeded} {demand.unit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Target Price</span>
                    <strong className="text-emerald-700 font-black text-sm">
                      {formatCurrency(demand.targetPricePerUnit)}/{demand.unit}
                    </strong>
                  </div>
                </div>

                {demand.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {demand.description}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {demand.deliveryCity}, {demand.deliveryState}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <Calendar className="w-3.5 h-3.5" />
                    By {formatDate(demand.requiredByDate)}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  {demand.bidsCount || 0} Farmer Bids
                </span>

                {isBuyer ? (
                  demand.buyerId === user?.id ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold"
                      onClick={() => handleOpenManageBids(demand)}
                    >
                      Review Bids ({demand.bidsCount || 0})
                    </Button>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200"
                      title="Only verified farmers can fulfill produce demands"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Farmer Supply Only</span>
                    </span>
                  )
                ) : (
                  demand.status === 'OPEN' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Send}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-soft-xs"
                      onClick={() => {
                        setSelectedDemandForBid(demand);
                        setBidQty(demand.quantityNeeded.toString());
                        setBidPrice(demand.targetPricePerUnit.toString());
                      }}
                    >
                      Supply This Demand
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Fulfilled
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Demand Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-soft-2xl my-8">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-600" />
              Post Produce Requirement
            </h3>
            <p className="text-xs text-slate-500">
              Directly source fresh farm harvests at your target budget with verified farmer delivery.
            </p>

            <form onSubmit={handlePostDemand} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade-A Red Tomatoes"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 500"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Price (₹/unit)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    placeholder="e.g. 28"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quality Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="GRADE_A">Grade A (Supermarket)</option>
                    <option value="GRADE_B">Grade B (Cooking / Restaurant)</option>
                    <option value="GRADE_C">Grade C (Processing)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Needed By Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Delivery City / Town</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru, Mysuru, Hubballi"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specifications & Quality Criteria</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Must be firm, harvested within 48h, uniform size."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Requirement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Place Bid Modal */}
      {selectedDemandForBid && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Submit Supply Bid</h3>
            <p className="text-xs text-slate-500">
              Buyer <strong>{selectedDemandForBid.buyerName}</strong> requires {selectedDemandForBid.quantityNeeded} {selectedDemandForBid.unit} of {selectedDemandForBid.cropName} at target rate {formatCurrency(selectedDemandForBid.targetPricePerUnit)}.
            </p>

            <form onSubmit={handlePlaceBid} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity You Can Supply ({selectedDemandForBid.unit})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidQty}
                  onChange={(e) => setBidQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Offered Price (₹ / {selectedDemandForBid.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min="1"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fulfillment Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Farm harvest ready Thursday morning with Grade-A certification."
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDemandForBid(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Supply Bid'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Review Bids Modal */}
      {selectedDemandForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-soft-2xl my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Farmer Supply Bids
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Requirements for <strong>{selectedDemandForReview.cropName}</strong> ({selectedDemandForReview.quantityNeeded} {selectedDemandForReview.unit})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemandForReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {isLoadingBids ? (
              <div className="py-8 flex justify-center">
                <Spinner size="md" text="Loading farmer supply bids..." />
              </div>
            ) : demandBids.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <p className="text-sm font-bold">No farmer bids received yet</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Regional farmers are reviewing your target price of {formatCurrency(selectedDemandForReview.targetPricePerUnit)}/{selectedDemandForReview.unit}. You will receive a notification as soon as a farmer bids.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {demandBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        {bid.farmerName || 'Verified Regional Farmer'}
                      </span>
                      {bid.status === 'ACCEPTED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          Accepted & Locked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          Pending Approval
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Offered Volume</span>
                        <strong className="text-slate-800 font-extrabold">{bid.offeredQuantity} {selectedDemandForReview.unit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Offered Rate</span>
                        <strong className="text-emerald-700 font-black">{formatCurrency(bid.offeredPricePerUnit)}/{selectedDemandForReview.unit}</strong>
                      </div>
                    </div>

                    {bid.notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                        "{bid.notes}"
                      </p>
                    )}

                    {bid.status === 'PENDING' && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft-xs"
                          onClick={() => handleAcceptBid(selectedDemandForReview.id, bid.id)}
                        >
                          Accept & Confirm Supply
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDemandForReview(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
