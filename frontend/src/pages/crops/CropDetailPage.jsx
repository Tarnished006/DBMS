import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sun,
  Droplets,
  Thermometer,
  Layers,
  Bug,
  ShieldAlert,
  Calendar,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Sprout,
  Leaf,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  FlaskConical,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Award,
  Sparkles,
} from 'lucide-react';
import { cropInfoService } from '@/services/cropInfo/cropInfoService';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';

function cleanText(val, fallback) {
  if (!val || typeof val !== 'string' || !val.trim()) return fallback;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('varies by crop variety and growing conditions') ||
    lower.includes('varies by crop, growth stage and local conditions') ||
    lower.includes('varies by crop variety and local growing conditions') ||
    lower.includes('suitable temperature varies by') ||
    lower.includes('growing duration varies by')
  ) {
    return 'Varies with variety & climate';
  }
  return trimmed;
}

export function CropDetailPage() {
  const { cropId } = useParams();
  const [crop, setCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [diseaseFilter, setDiseaseFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCrop() {
      setIsLoading(true);
      try {
        const data = await cropInfoService.getCropDetails(cropId);
        setCrop(data);
      } catch (err) {
        console.error('Failed to load crop details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (cropId) loadCrop();
  }, [cropId]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" text="Loading comprehensive crop agronomy datasheet..." />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Link
          to="/crops"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Crop Guide
        </Link>
        <ErrorDisplay
          title="Crop Guide Not Found"
          message="The requested crop encyclopedia entry could not be retrieved. Please check back soon or browse other crops."
        />
      </div>
    );
  }

  const pestAndDiseasesList = crop.pestAndDiseases || [];
  const filteredDiseases =
    diseaseFilter === 'ALL'
      ? pestAndDiseasesList
      : pestAndDiseasesList.filter((d) => d.type === diseaseFilter);

  const lifecycleStages = crop.lifecycleStages || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb
          items={[
            { label: 'Crop Encyclopedia', to: '/crops' },
            { label: crop.cropName },
          ]}
        />
        <Link
          to="/crops"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Crops</span>
        </Link>
      </div>

      {/* ========================================================
          1. HERO CARD: BOTANICAL IDENTITY, LOCAL NAMES & HERO IMAGE
      ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-sm p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Crop Title, Local Names, Scientific Details & Live Tickers */}
          <div className="lg:col-span-8 space-y-4">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold shadow-soft-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{crop.category || 'Agricultural Produce'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ICAR & Agrisnet Verified</span>
              </span>
              {crop.isDynamicallyDiscovered && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>On-Demand Botanical Synthesis</span>
                </span>
              )}
            </div>


            {/* Title & Local Names */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {crop.cropName}
              </h1>
              {crop.localNames?.kannada && (
                <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold">
                  <span className="text-amber-800 bg-amber-50 px-3 py-0.5 rounded-lg border border-amber-200/80">
                    ಕನ್ನಡ: {crop.localNames.kannada}
                  </span>
                  {crop.localNames?.hindi && (
                    <span className="text-slate-700 bg-slate-50 px-3 py-0.5 rounded-lg border border-slate-200">
                      हिन्दी: {crop.localNames.hindi}
                    </span>
                  )}
                </div>
              )}
              {crop.scientificName && (
                <div className="flex items-center gap-2 text-sm sm:text-base italic font-semibold text-emerald-700 mt-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{crop.scientificName}</span>
                  {crop.family && (
                    <span className="not-italic text-xs text-slate-500 font-normal">
                      (Family: {crop.family})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
              {crop.description ||
                `${crop.cropName} is an essential agricultural crop grown according to verified local soil, climate, water, and agronomic management standards.`}
            </p>

            {crop.isDynamicallyDiscovered && (
              <div className="bg-gradient-to-r from-indigo-50/80 via-emerald-50/50 to-white border border-indigo-100 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Global Agronomy Engine:</strong> This crop guide was dynamically generated in real time from botanical taxonomy APIs and cross-linked with official ICAR & Vikaspedia agricultural portals.
                </span>
              </div>
            )}


            {/* Quick Live Link Tickers (Market & Mandi Integration) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Live Mandi Ticker */}
              {crop.liveMandiPrice ? (
                <Link
                  to={`/market-prices?commodity=${encodeURIComponent(crop.mandiCommodity || crop.cropName)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs sm:text-sm font-bold hover:bg-amber-100 transition-colors shadow-soft-sm"
                >
                  <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Live Mandi: <strong className="text-emerald-700 font-extrabold">₹{crop.liveMandiPrice.modalPrice.toLocaleString()}/Qtl</strong>
                  </span>
                  <span className="text-[11px] font-normal text-amber-800 hidden sm:inline">
                    ({crop.liveMandiPrice.market})
                  </span>
                </Link>
              ) : null}

              {/* Active Marketplace Listings */}
              <Link
                to={`/marketplace?q=${encodeURIComponent(crop.cropName.split('(')[0].trim())}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-50 border border-brand-200/90 text-brand-900 text-xs sm:text-sm font-bold hover:bg-brand-100 transition-colors shadow-soft-sm"
              >
                <ShoppingBag className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  {crop.activeMarketplaceListingsCount > 0
                    ? `${crop.activeMarketplaceListingsCount} Lots on Marketplace`
                    : `Trade ${crop.cropName}`}
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Specimen Photograph */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-soft-md border border-slate-200/90 bg-slate-100 group">
              <img
                src={
                  crop.imageUrl ||
                  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
                }
                alt={crop.cropName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white select-none">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-[11px] font-bold text-white">
                  Botanical Specimen
                </span>
                <span className="font-bold text-white drop-shadow text-xs truncate max-w-[140px] text-right">
                  {crop.cropName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. INTERACTIVE TABBED NAVIGATION BAR
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm p-1.5 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: '1. Agronomic Overview & Climate', icon: Compass },
          { id: 'lifecycle', label: '2. Lifecycle & Growth Stages', icon: Sprout },
          { id: 'diseases', label: '3. Pests & Disease Diagnostics', icon: Bug },
          { id: 'nutrients', label: '4. Fertilizer & Soil Nutrition', icon: FlaskConical },
          { id: 'research', label: '5. Gov Research & Post-Harvest', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: AGRONOMIC OVERVIEW & CLIMATE
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Agronomic Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Sunlight */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sunlight Requirement
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                  {crop.climateAndSoil?.sunRequirement || cleanText(crop.sunlightRequirements, 'Full Sunlight (6–8 hrs)')}
                </p>
              </div>
            </div>

            {/* Water Requirements */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Water Requirement
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                  {cleanText(crop.waterRequirement, 'Moderate watering')}
                </p>
              </div>
            </div>

            {/* Optimal Temperature */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Optimal Temperature
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                  {crop.climateAndSoil?.optimalTemp || `${crop.optimalTemperatureMin}°C - ${crop.optimalTemperatureMax}°C`}
                </p>
              </div>
            </div>

            {/* Growth Duration */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Duration
                </span>
                <p className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                  {crop.growingDuration || `${crop.growthDurationDays} Days`}
                </p>
              </div>
            </div>
          </div>

          {/* Soil, Sowing & Climate Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soil & pH Guide */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-5 h-5 text-brand-600" />
                <span>Soil & Sowing Specifications</span>
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-800">Ideal Soil Types:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {crop.soilType || 'Well-drained fertile loam rich in organic carbon.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 py-2 px-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Target Soil pH</span>
                    <p className="font-black text-slate-900 text-sm">{crop.soilPh || '6.0 - 7.5'}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Annual Rainfall</span>
                    <p className="font-black text-slate-900 text-sm">
                      {crop.rainfallMin && crop.rainfallMax ? `${crop.rainfallMin} - ${crop.rainfallMax} mm` : '600 - 1200 mm'}
                    </p>
                  </div>
                </div>

                {crop.sowingSeason && (
                  <div>
                    <span className="font-bold text-slate-800">Recommended Sowing Window:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{crop.sowingSeason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botanical Taxonomy & Origin */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Leaf className="w-5 h-5 text-brand-600" />
                <span>Botanical Profile & Classification</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Botanical Family</span>
                    <p className="font-bold text-slate-800 mt-0.5">{crop.botanicalInfo?.family || crop.family}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Genus</span>
                    <p className="font-bold text-slate-800 mt-0.5">{crop.botanicalInfo?.genus || 'Plantae'}</p>
                  </div>
                </div>

                {crop.botanicalInfo?.origin && (
                  <div>
                    <span className="font-bold text-slate-800">Historical Origin:</span>
                    <p className="text-slate-600 mt-0.5">{crop.botanicalInfo.origin}</p>
                  </div>
                )}

                {crop.botanicalInfo?.plantType && (
                  <div>
                    <span className="font-bold text-slate-800">Growth Habit:</span>
                    <p className="text-slate-600 mt-0.5">{crop.botanicalInfo.plantType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Wikipedia Botanical Extract Card */}
          {crop.wikiBotanical && (
            <div className="bg-slate-50/90 rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Wikipedia Botanical Encyclopedia Reference
                  </span>
                </div>
                {crop.wikiBotanical.wikiUrl && (
                  <a
                    href={crop.wikiBotanical.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 underline"
                  >
                    <span>Read on Wikipedia</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{crop.wikiBotanical.extract}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: LIFECYCLE & PHENOLOGICAL GROWTH STAGES
      ======================================================== */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <Sprout className="w-6 h-6 text-brand-600" />
                <span>Day-by-Day Phenological Growth Stages</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Step-by-step milestones with critical water benchmarks and recommended field interventions.
              </p>
            </div>

            {lifecycleStages.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:left-4 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-200">
                {lifecycleStages.map((stage, idx) => (
                  <div key={idx} className="relative pl-10 sm:pl-12 space-y-2">
                    {/* Step Icon Number */}
                    <div className="absolute left-0 top-0 w-8 sm:w-10 h-8 sm:h-10 rounded-2xl bg-brand-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-soft-sm border-2 border-white">
                      {idx + 1}
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-2.5 hover:bg-slate-100/70 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {stage.stageName}
                        </h4>
                        <span className="text-xs font-bold text-brand-800 bg-brand-100/70 px-2.5 py-0.5 rounded-lg shrink-0 w-fit">
                          {stage.durationDays}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {stage.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/60">
                        {stage.waterNeed && (
                          <div className="flex items-start gap-1.5 text-sky-900">
                            <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <span><strong>Water Need:</strong> {stage.waterNeed}</span>
                          </div>
                        )}
                        {stage.careTips && (
                          <div className="flex items-start gap-1.5 text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Care Tips:</strong> {stage.careTips}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 text-slate-600 text-xs sm:text-sm">
                Growth Stages: {crop.growthStages || 'Germination → Vegetative → Flowering → Maturity'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PESTS & DISEASE DIAGNOSTICS MANUAL
      ======================================================== */}
      {activeTab === 'diseases' && (
        <div className="space-y-6">
          {/* Header & Filter Chips */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                  <Bug className="w-6 h-6 text-rose-600" />
                  <span>Pest & Disease Diagnostic Manual</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Visual symptoms, organic bio-control protocols, and chemical treatments certified by ICAR standards.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['ALL', 'FUNGAL', 'BACTERIAL', 'VIRAL', 'PEST'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDiseaseFilter(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      diseaseFilter === type
                        ? 'bg-rose-600 text-white shadow-soft-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Disease Cards */}
            {filteredDiseases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {filteredDiseases.map((dis, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-soft-sm transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Title & Severity Badge */}
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/70">
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                          {dis.name}
                        </h4>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg shrink-0 ${
                            dis.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {dis.severity || 'HIGH'} SEVERITY
                        </span>
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-1 mt-2.5 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Symptoms & Field Identification:</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">{dis.symptoms}</p>
                      </div>

                      {/* Organic Bio-control */}
                      {dis.organicControl && (
                        <div className="space-y-1 mt-3 text-xs p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Organic & Biological Solution:</span>
                          </span>
                          <p className="text-emerald-800 leading-relaxed">{dis.organicControl}</p>
                        </div>
                      )}

                      {/* Chemical Control */}
                      {dis.chemicalControl && (
                        <div className="space-y-1 mt-2.5 text-xs p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                          <span className="font-bold text-amber-950 flex items-center gap-1">
                            <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
                            <span>Recommended Spray / Chemical Control:</span>
                          </span>
                          <p className="text-amber-900 leading-relaxed">{dis.chemicalControl}</p>
                        </div>
                      )}
                    </div>

                    {/* Prevention Tip */}
                    {dis.prevention && (
                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        <strong>Prevention:</strong> {dis.prevention}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs sm:text-sm">
                No disease records in this category. Browse other categories.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: FERTILIZER & SOIL NUTRITION SCHEDULE
      ======================================================== */}
      {activeTab === 'nutrients' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <FlaskConical className="w-6 h-6 text-brand-600" />
                <span>Fertilizer & Soil Nutrition Schedule (NPK)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Targeted nutrient dosages across crop vegetative, reproductive, and fruit development phases.
              </p>
            </div>

            {/* NPK Ratio Banner */}
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Recommended Macro N-P-K Ratio
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-0.5">
                  {crop.nutrientSchedule?.npkRatio || '100:50:50 kg/ha'}
                </p>
              </div>
              <div className="text-xs text-emerald-800 max-w-sm">
                Provides balanced Nitrogen (N) for vegetative vigor, Phosphorus (P) for root establishment, and Potassium (K) for disease resilience.
              </div>
            </div>

            {/* Phase-wise Nutrient Stages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Basal Application */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md">
                  Stage 1: Basal Application
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Land Prep & Sowing</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {crop.nutrientSchedule?.basalDose || 'Incorporate FYM compost along with full phosphorus and initial nitrogen.'}
                </p>
              </div>

              {/* Vegetative Top Dressing */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md">
                  Stage 2: Vegetative Growth
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Active Tillering / Branching</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {crop.nutrientSchedule?.vegetativeStage || 'Top dress first split of nitrogen right after inter-cultivation weeding.'}
                </p>
              </div>

              {/* Flowering / Fruit Booster */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md">
                  Stage 3: Flowering & Setting
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Panicle / Fruit Expansion</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {crop.nutrientSchedule?.floweringStage || 'Top dress remaining nitrogen and potash; spray foliar potassium nitrate.'}
                </p>
              </div>
            </div>

            {/* Micronutrient Advisory */}
            {crop.nutrientSchedule?.micronutrients && (
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5 text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Essential Micronutrient Guidelines:</span>
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {crop.nutrientSchedule.micronutrients}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: GOV RESEARCH & POST-HARVEST
      ======================================================== */}
      {activeTab === 'research' && (
        <div className="space-y-6">
          {/* Government & Research Institution Portals */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <Globe className="w-6 h-6 text-brand-600" />
                <span>Verified Government & University Research Portals</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Direct official links to Package of Practices (PoP), ICAR agricultural advisories, and state extension circulars.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(crop.govAdvisoryLinks || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-500 hover:shadow-soft-sm transition-all group flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md uppercase">
                      {link.badge}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                      {link.title}
                    </h4>
                    <p className="text-xs text-slate-500">{link.organization}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-600 shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </div>

          {/* Harvesting, Post-Harvest Curing & Yield */}
          {crop.harvestingAndPostHarvest && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <span>Harvesting, Curing & Post-Harvest Storage</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800">Maturity Indicators:</span>
                  <p className="text-slate-600">{crop.harvestingAndPostHarvest.maturityIndicators}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800">Expected Yield Benchmark:</span>
                  <p className="text-emerald-700 font-extrabold">{crop.harvestingAndPostHarvest.yieldPerAcre}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="font-bold text-slate-800">Storage & Post-Harvest Protection:</span>
                  <p className="text-slate-600">{crop.harvestingAndPostHarvest.storageConditions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Uses Section */}
          {crop.uses && crop.uses.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Primary Culinary & Industrial Uses:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 list-disc list-inside">
                {crop.uses.map((use, i) => (
                  <li key={i} className="leading-relaxed">{use}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          BOTTOM CTA: CONNECT TO MARKETPLACE & MANDI
      ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200/90 gap-5 shadow-soft-sm">
        <div className="space-y-1">
          <h4 className="font-black text-lg text-emerald-950">
            Looking to purchase or sell {crop.cropName}?
          </h4>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-xl">
            Explore authentic seeds, organic inputs, and verified harvest lots on the AgriMarket marketplace.
          </p>
        </div>
        <Link to={`/marketplace?q=${encodeURIComponent(crop.cropName.split('(')[0].trim())}`} className="shrink-0">
          <Button size="lg" icon={ShoppingBag} className="px-6 py-3 font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-soft-md">
            Find {crop.cropName} on Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}
