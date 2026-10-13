import React, { useState, useEffect } from 'react';
import { Target, Plus, MapPin, Calendar, CheckCircle2, Award, Filter, Search, Send } from 'lucide-react';
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

  const { user } = useAuth();
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
      toast.error('Please login to post a produce requirement.');
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
      toast.error('Please login as a farmer to place a supply bid.');
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

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowPostModal(true)}
          className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold self-start md:self-auto shadow-soft-md"
        >
          Post a Requirement
        </Button>
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
            Be the first bulk purchaser or restaurant to post a produce demand, or clear your search filters.
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
                <span className="text-xs text-slate-400 font-bold">
                  {demand.bidsCount || 0} Farmer Bids
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Send}
                  onClick={() => {
                    setSelectedDemandForBid(demand);
                    setBidQty(demand.quantityNeeded.toString());
                    setBidPrice(demand.targetPricePerUnit.toString());
                  }}
                >
                  Supply This Demand
                </Button>
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
    </div>
  );
}
