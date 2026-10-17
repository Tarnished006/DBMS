import React, { useState, useEffect } from 'react';
import {
  Truck,
  Users,
  Sparkles,
  MapPin,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  ShoppingBag,
  Scale,
  Calendar,
  BadgeCheck,
  X,
  Receipt,
  Printer,
  Clock,
  Search,
  ExternalLink,
} from 'lucide-react';
import { poolService } from '@/services/pool/poolService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';

const COMMON_CROPS = [
  'Tomatoes',
  'Onion',
  'Potato',
  'Capsicum',
  'Cabbage',
  'Papaya',
  'Cauliflower',
  'Green Chilli',
  'Carrot',
  'Banana',
];

const COMMON_TALUKS = [
  { name: 'Devanahalli', district: 'Bengaluru Rural' },
  { name: 'Nelamangala', district: 'Bengaluru Rural' },
  { name: 'Doddaballapur', district: 'Bengaluru Rural' },
  { name: 'Hoskote', district: 'Bengaluru Rural' },
  { name: 'Kolar', district: 'Kolar' },
  { name: 'Malur', district: 'Kolar' },
  { name: 'Mandya', district: 'Mandya' },
  { name: 'Maddur', district: 'Mandya' },
  { name: 'Mysuru', district: 'Mysuru' },
  { name: 'Hunsur', district: 'Mysuru' },
];

const VEHICLE_OPTIONS = [
  { id: 'Tata Ace Mega (3.5 MT)', name: 'Tata Ace Mega (3.5 MT)', capacity: 3500, label: 'Small Batch (Up to 3,500 KG)' },
  { id: 'Tata 407 LPT (5 MT)', name: 'Tata 407 LPT (5 MT)', capacity: 5000, label: 'Medium Truck (Up to 5,000 KG)' },
  { id: 'Eicher Pro 2049 (10 MT)', name: 'Eicher Pro 2049 (10 MT)', capacity: 10000, label: 'Heavy Truck (Up to 10,000 KG)' },
];

export function ProducePoolingPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion state
  const [expandedManifestId, setExpandedManifestId] = useState(null);
  const [pledgingPoolId, setPledgingPoolId] = useState(null);

  // Pledge form state
  const [pledgeForm, setPledgeForm] = useState({
    farmerName: '',
    villageOrTown: '',
    quantity: '',
    pricePerUnit: '',
  });
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);

  // Digital Loading Slip modal state
  const [issuedSlip, setIssuedSlip] = useState(null);

  // Request New Truck Route Modal state
  const [isRequestRouteModalOpen, setIsRequestRouteModalOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({
    cropName: 'Capsicum',
    talukName: 'Devanahalli',
    districtName: 'Bengaluru Rural',
    villageOrTown: '',
    farmerName: '',
    initialQuantity: '500',
    pricePerUnit: '35',
    targetVehicle: 'Tata Ace Mega (3.5 MT)',
    departureDate: 'Tomorrow at 06:30 AM',
    destinationMandi: 'Yeshwanthpur Wholesale Terminal, Bengaluru',
  });
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);

  useEffect(() => {
    loadPools();
  }, []);

  async function loadPools() {
    setIsLoading(true);
    try {
      const data = await poolService.getPools();
      setPools(data || []);
    } catch (err) {
      console.error('Failed to load produce pools:', err);
      error?.('Failed to load produce pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggleManifest(poolId) {
    setExpandedManifestId((prev) => (prev === poolId ? null : poolId));
  }

  function handleOpenPledge(pool) {
    if (pledgingPoolId === pool.id) {
      setPledgingPoolId(null);
    } else {
      setPledgingPoolId(pool.id);
      setPledgeForm({
        farmerName: user?.fullName || 'Ramesh Kumar (Gowda Farm)',
        villageOrTown: `${pool.talukName} Village`,
        quantity: '250',
        pricePerUnit: String(pool.avgPricePerUnit || 25),
      });
    }
  }

  async function handleSubmitPledge(e, pool) {
    e.preventDefault();
    const qty = parseFloat(pledgeForm.quantity);
    const price = parseFloat(pledgeForm.pricePerUnit);

    if (!qty || qty <= 0) {
      error?.('Please enter a valid harvest quantity.');
      return;
    }
    if (!price || price <= 0) {
      error?.('Please enter a valid price per unit.');
      return;
    }

    setIsSubmittingPledge(true);
    try {
      const result = await poolService.pledgeToPool({
        poolId: pool.id,
        farmerName: pledgeForm.farmerName.trim() || user?.fullName || 'Verified Farmer',
        farmerId: user?.id || 'demo-farmer-id',
        quantity: qty,
        pricePerUnit: price,
        villageOrTown: pledgeForm.villageOrTown.trim() || `${pool.talukName} Village`,
      });

      if (result.success && result.pool) {
        // Update pool in local state
        setPools((prev) =>
          prev.map((p) => (p.id === pool.id ? result.pool : p))
        );
        success?.(`Pledge registered! Truck capacity updated for ${pool.cropName}.`);
        setPledgingPoolId(null);
        setIssuedSlip(result.slip);
        // Automatically open manifest so farmer can see their lot
        setExpandedManifestId(pool.id);
      }
    } catch (err) {
      console.error('Failed to pledge harvest:', err);
      error?.(err?.response?.data?.message || 'Failed to submit harvest pledge.');
    } finally {
      setIsSubmittingPledge(false);
    }
  }

  function handleOpenRequestRouteModal() {
    setRouteForm({
      cropName: 'Capsicum',
      talukName: 'Devanahalli',
      districtName: 'Bengaluru Rural',
      villageOrTown: 'Kannamangala Village',
      farmerName: user?.fullName || 'Ramesh Kumar (Gowda Farm)',
      initialQuantity: '500',
      pricePerUnit: '35',
      targetVehicle: 'Tata Ace Mega (3.5 MT)',
      departureDate: 'Tomorrow at 06:30 AM',
      destinationMandi: 'Yeshwanthpur Wholesale Terminal, Bengaluru',
    });
    setIsRequestRouteModalOpen(true);
  }

  function handleTalukChange(talukName) {
    const found = COMMON_TALUKS.find((t) => t.name === talukName);
    setRouteForm((prev) => ({
      ...prev,
      talukName,
      districtName: found?.district || 'Karnataka',
    }));
  }

  async function handleSubmitRoute(e) {
    e.preventDefault();
    const qty = parseFloat(routeForm.initialQuantity);
    const price = parseFloat(routeForm.pricePerUnit);

    if (!routeForm.cropName.trim()) {
      error?.('Please specify a crop name.');
      return;
    }
    if (!qty || qty <= 0) {
      error?.('Please specify a valid harvest quantity.');
      return;
    }
    if (!price || price <= 0) {
      error?.('Please specify an expected unit price.');
      return;
    }

    setIsSubmittingRoute(true);
    try {
      const result = await poolService.requestRoute({
        cropName: routeForm.cropName.trim(),
        talukName: routeForm.talukName,
        districtName: routeForm.districtName,
        villageOrTown: routeForm.villageOrTown.trim() || `${routeForm.talukName} Hub`,
        farmerName: routeForm.farmerName.trim() || user?.fullName || 'Initiating Farmer',
        farmerId: user?.id || 'demo-farmer-id',
        initialQuantity: qty,
        pricePerUnit: price,
        targetVehicle: routeForm.targetVehicle,
        departureDate: routeForm.departureDate,
        destinationMandi: routeForm.destinationMandi,
      });

      if (result.success) {
        success?.(result.message || 'New truck pool route initiated successfully!');
        setIsRequestRouteModalOpen(false);

        // If returned pool exists, place it at the top of pools list
        if (result.pool) {
          setPools((prev) => {
            const exists = prev.some((p) => p.id === result.pool.id);
            if (exists) {
              return prev.map((p) => (p.id === result.pool.id ? result.pool : p));
            }
            return [result.pool, ...prev];
          });
          setExpandedManifestId(result.pool.id);
        }

        if (result.slip) {
          setIssuedSlip(result.slip);
        }
      }
    } catch (err) {
      console.error('Failed to request truck route:', err);
      error?.(err?.response?.data?.message || 'Failed to request new truck route.');
    } finally {
      setIsSubmittingRoute(false);
    }
  }

  const filteredPools = pools.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.cropName.toLowerCase().includes(q) ||
      (p.talukName && p.talukName.toLowerCase().includes(q)) ||
      (p.districtName && p.districtName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-soft-xl relative overflow-hidden">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
            <Truck className="w-4 h-4 text-emerald-400" />
            Shared Logistics & Village Freight Consolidation
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Community Produce Pooling
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Individual smallholder farmers in the same Taluk combine their harvests into single, consolidated truckloads. Cut freight costs by up to <strong>75%</strong>, eliminate middlemen exploitation, and sell directly to wholesale buyers.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-emerald-200">
            <div className="flex items-center gap-2 bg-emerald-800/40 px-3 py-1.5 rounded-xl border border-emerald-700/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certified APMC Logistics Hubs</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-800/40 px-3 py-1.5 rounded-xl border border-emerald-700/50">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Bulk Vehicle Rate Reductions</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-800/40 px-3 py-1.5 rounded-xl border border-emerald-700/50">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>1-Click Direct Lot Checkout</span>
            </div>
          </div>

          <div className="pt-3">
            <Button
              variant="secondary"
              size="md"
              icon={Truck}
              onClick={handleOpenRequestRouteModal}
              className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-black shadow-soft-lg"
            >
              + Request New Truck Route for My Village
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop, taluk, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-slate-500 font-semibold">
            Showing <strong>{filteredPools.length}</strong> active regional produce pools
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Truck}
            onClick={handleOpenRequestRouteModal}
          >
            + Request Truck
          </Button>
        </div>
      </div>

      {/* Pools Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Consolidating regional produce clusters and truck capacities..." />
        </div>
      ) : filteredPools.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-4">
          <Truck className="w-14 h-14 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">No active produce pools found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? 'Try searching for a different crop name or district.'
                : 'Have produce to ship? Be the first to initiate a consolidated truck route from your Taluk!'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Truck}
            onClick={handleOpenRequestRouteModal}
          >
            Request First Truck for Your Taluk
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPools.map((pool) => {
            const isManifestOpen = expandedManifestId === pool.id;
            const isPledging = pledgingPoolId === pool.id;
            const targetCap = pool.targetCapacity || 3500;
            const fillPercent = Math.min(100, Math.round((pool.totalQuantity / targetCap) * 100));

            return (
              <div
                key={pool.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-xs hover:border-emerald-300 transition-all"
              >
                {/* Main Card Summary */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Village Freight Cluster
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">•</span>
                        <span className="text-xs font-bold text-slate-600">
                          {pool.vehicleType || 'Tata Ace Mega (3.5 MT)'}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                        {pool.cropName}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {pool.talukName}, {pool.districtName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-soft-xs">
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        {pool.estimatedFreightSavingsPercentage}% Freight Cost Saved
                      </span>
                    </div>
                  </div>

                  {/* Truck Capacity Progress Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        Truckload Capacity Fill: <strong>{fillPercent}%</strong>
                      </span>
                      <span className="font-bold text-slate-500">
                        <strong>{pool.totalQuantity.toLocaleString()}</strong> / {targetCap.toLocaleString()} {pool.unit}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fillPercent >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : fillPercent >= 50
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                            : 'bg-gradient-to-r from-amber-400 to-teal-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Pickup Bay: <strong>{pool.pickupHub || `${pool.talukName} APMC Logistics Bay 3`}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Departure: <strong>{pool.departureTime || 'Tomorrow at 06:30 AM'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft-xs">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">
                        Participating Farmers
                      </span>
                      <strong className="text-slate-900 font-black text-lg flex items-center gap-1.5 mt-0.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        {pool.participatingFarmersCount} Smallholders
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft-xs">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">
                        Consolidated Volume
                      </span>
                      <strong className="text-slate-900 font-black text-lg flex items-center gap-1.5 mt-0.5">
                        <Scale className="w-4 h-4 text-emerald-600" />
                        {pool.totalQuantity.toLocaleString()} {pool.unit}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft-xs col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">
                        Pool Average Price
                      </span>
                      <strong className="text-emerald-700 font-black text-lg block mt-0.5">
                        {formatCurrency(pool.avgPricePerUnit)}/{pool.unit}
                      </strong>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                    <Button
                      variant={isManifestOpen ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleManifest(pool.id)}
                      icon={isManifestOpen ? ChevronUp : ChevronDown}
                      className="w-full sm:w-auto"
                    >
                      {isManifestOpen
                        ? 'Hide Truck Manifest'
                        : `Inspect Truck Manifest & Farmers (${pool.products?.length || 0} Lots)`}
                    </Button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleOpenPledge(pool)}
                        className="w-full sm:w-auto"
                      >
                        {isPledging ? 'Close Pledge Form' : '+ Join Truck (Pledge Harvest)'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Inline Farmer Pledge Drawer */}
                {isPledging && (
                  <div className="bg-emerald-50/50 border-t border-emerald-100 p-6 sm:p-8 transition-all">
                    <div className="max-w-2xl space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                            <Plus className="w-4 h-4" /> Farmer Harvest Pledge
                          </div>
                          <h3 className="text-lg font-black text-slate-900 mt-0.5">
                            Add Your {pool.cropName} Harvest to This Consolidated Truck
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Pledge your harvested quantity to reserve space on the {pool.vehicleType}. Your lot will be weighed at {pool.pickupHub || 'APMC Logistics Bay'} with certified digital receipts.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPledgingPoolId(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-emerald-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => handleSubmitPledge(e, pool)}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
                      >
                        <Input
                          label="Farmer / Farm Name"
                          value={pledgeForm.farmerName}
                          onChange={(e) =>
                            setPledgeForm({ ...pledgeForm, farmerName: e.target.value })
                          }
                          placeholder="e.g. Ramesh Kumar"
                          required
                        />

                        <Input
                          label="Village or Farm Location"
                          value={pledgeForm.villageOrTown}
                          onChange={(e) =>
                            setPledgeForm({ ...pledgeForm, villageOrTown: e.target.value })
                          }
                          placeholder={`e.g. ${pool.talukName} Village`}
                          required
                        />

                        <Input
                          label={`Quantity to Pledge (${pool.unit})`}
                          type="number"
                          min="1"
                          value={pledgeForm.quantity}
                          onChange={(e) =>
                            setPledgeForm({ ...pledgeForm, quantity: e.target.value })
                          }
                          placeholder="e.g. 250"
                          required
                        />

                        <Input
                          label={`Desired Price per ${pool.unit} (₹)`}
                          type="number"
                          step="0.5"
                          min="1"
                          value={pledgeForm.pricePerUnit}
                          onChange={(e) =>
                            setPledgeForm({ ...pledgeForm, pricePerUnit: e.target.value })
                          }
                          placeholder={`Avg ₹${pool.avgPricePerUnit}`}
                          required
                        />

                        <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-slate-600">
                            Estimated gross batch value:{' '}
                            <strong className="text-emerald-700 font-bold">
                              {formatCurrency(
                                (parseFloat(pledgeForm.quantity) || 0) *
                                  (parseFloat(pledgeForm.pricePerUnit) || 0)
                              )}
                            </strong>{' '}
                            (Saving ~{pool.estimatedFreightSavingsPercentage}% freight vs private vehicle)
                          </span>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            isLoading={isSubmittingPledge}
                            icon={CheckCircle2}
                          >
                            Confirm & Reserve Space
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Expanded Truck Manifest & Farmers Table */}
                {isManifestOpen && (
                  <div className="bg-slate-50 border-t border-slate-200 p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-emerald-600" />
                          Consolidated Truck Manifest & Farmer Lots
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Verified produce batches pooled for shared dispatch to {pool.destinationMandi || 'Yeshwanthpur Wholesale Terminal'}.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-center">
                        Total {pool.products?.length || 0} Lots in Pool
                      </span>
                    </div>

                    {(!pool.products || pool.products.length === 0) ? (
                      <div className="bg-white rounded-2xl p-6 text-center text-slate-500 text-xs">
                        No individual lots currently listed in this pool.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs bg-white rounded-2xl border border-slate-200 overflow-hidden">
                          <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4">Farmer / Farm</th>
                              <th className="py-3 px-4">Origin Village</th>
                              <th className="py-3 px-4">Quality Grade</th>
                              <th className="py-3 px-4 text-right">Lot Quantity</th>
                              <th className="py-3 px-4 text-right">Price / Unit</th>
                              <th className="py-3 px-4 text-right">Total Value</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pool.products.map((item, idx) => {
                              const lotTotal = item.quantity * item.pricePerUnit;
                              return (
                                <tr key={item.id || idx} className="hover:bg-emerald-50/40 transition-colors">
                                  <td className="py-3.5 px-4 font-bold text-slate-900">
                                    <div className="flex items-center gap-1.5">
                                      <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>{item.farmerName || 'Verified Farmer'}</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-600">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      {item.villageOrTown || `${pool.talukName} Hub`}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                                      {item.qualityGrade || 'Grade A (Farm Fresh)'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                                    {item.quantity.toLocaleString()} {item.unit || pool.unit}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                                    {formatCurrency(item.pricePerUnit)}/{item.unit || pool.unit}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                                    {formatCurrency(lotTotal)}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Link to={`/checkout/${item.id}`}>
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft-xs hover:shadow-brand-glow transition-all"
                                        >
                                          <ShoppingBag className="w-3.5 h-3.5" />
                                          Buy Lot
                                        </button>
                                      </Link>
                                      <Link to={`/products/${item.id}`} title="View Lot Listing">
                                        <button
                                          type="button"
                                          className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 text-slate-500 hover:text-emerald-700 transition-colors"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Request New Truck Route Modal */}
      {isRequestRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-soft-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRequestRouteModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-soft-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                  Route Initiation
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Request New Community Truck Route
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Start a consolidated truck for your crop and Taluk. The route will be published immediately so other local farmers can pool their harvest and share freight costs.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitRoute} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Crop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="crop-options"
                    value={routeForm.cropName}
                    onChange={(e) => setRouteForm({ ...routeForm, cropName: e.target.value })}
                    placeholder="e.g. Capsicum, Tomato, Potato"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="crop-options">
                    {COMMON_CROPS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Taluk Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Taluk Region <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={routeForm.talukName}
                    onChange={(e) => handleTalukChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {COMMON_TALUKS.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.district})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Origin Village */}
                <Input
                  label="Origin Village / Pickup Hub"
                  value={routeForm.villageOrTown}
                  onChange={(e) => setRouteForm({ ...routeForm, villageOrTown: e.target.value })}
                  placeholder={`e.g. Kannamangala Village, ${routeForm.talukName}`}
                  required
                />

                {/* Farmer / Farm Contact */}
                <Input
                  label="Lead Farmer / Contact Name"
                  value={routeForm.farmerName}
                  onChange={(e) => setRouteForm({ ...routeForm, farmerName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />

                {/* Initial Quantity */}
                <Input
                  label="Initial Harvest Quantity (KG)"
                  type="number"
                  min="1"
                  value={routeForm.initialQuantity}
                  onChange={(e) => setRouteForm({ ...routeForm, initialQuantity: e.target.value })}
                  placeholder="e.g. 500"
                  required
                />

                {/* Desired Price per KG */}
                <Input
                  label="Desired Price per KG (₹)"
                  type="number"
                  step="0.5"
                  min="1"
                  value={routeForm.pricePerUnit}
                  onChange={(e) => setRouteForm({ ...routeForm, pricePerUnit: e.target.value })}
                  placeholder="e.g. 35"
                  required
                />

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={routeForm.targetVehicle}
                    onChange={(e) => setRouteForm({ ...routeForm, targetVehicle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {VEHICLE_OPTIONS.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Departure Schedule */}
                <Input
                  label="Preferred Departure Schedule"
                  value={routeForm.departureDate}
                  onChange={(e) => setRouteForm({ ...routeForm, departureDate: e.target.value })}
                  placeholder="Tomorrow at 06:30 AM"
                  required
                />

                {/* Destination Mandi */}
                <div className="sm:col-span-2">
                  <Input
                    label="Destination Mandi / Wholesale Terminal"
                    value={routeForm.destinationMandi}
                    onChange={(e) => setRouteForm({ ...routeForm, destinationMandi: e.target.value })}
                    placeholder="e.g. Yeshwanthpur Wholesale Terminal, Bengaluru"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRequestRouteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingRoute}
                  icon={CheckCircle2}
                >
                  Confirm & Launch Truck Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gate Pass & Loading Slip Modal */}
      {issuedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setIssuedSlip(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-soft-xs">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                {issuedSlip.bookingType || 'Official APMC Loading Pass'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Produce Pool Reservation Slip
              </h3>
              <p className="text-xs text-slate-500">
                Your produce lot has been reserved and registered on the consolidated truck.
              </p>
            </div>

            {/* Slip details ticket */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Waybill / Slip No</span>
                <strong className="font-mono font-bold text-slate-900 text-sm">
                  {issuedSlip.slipNumber}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer Name</span>
                  <strong className="text-slate-900">{issuedSlip.farmerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Origin Village</span>
                  <strong className="text-slate-900">{issuedSlip.village}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Crop & Weight</span>
                  <strong className="text-emerald-700 font-bold">
                    {issuedSlip.cropName} ({issuedSlip.initialQuantity || issuedSlip.quantityPledged})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Assigned</span>
                  <strong className="text-slate-900">{issuedSlip.vehicleAssigned || 'Tata Ace Mega (3.5 MT)'}</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Logistics Bay</span>
                  <strong className="text-slate-900">{issuedSlip.pickupBay}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Weighment Schedule</span>
                  <strong className="text-slate-900">{issuedSlip.departureSchedule}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Freight Savings</span>
                  <strong className="text-emerald-700 font-bold">{issuedSlip.freightSavings}</strong>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">
              <strong>Instructions:</strong> Present this digital slip or SMS confirmation upon vehicle loading at the designated APMC bay. Weighment certificate will be issued automatically.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Slip
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIssuedSlip(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProducePoolingPage;
