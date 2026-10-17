import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Sprout,
  ArrowRight,
  X,
  Sparkles,
  Clock,
  Droplets,
  TrendingUp,
  Tag,
  Filter,
} from 'lucide-react';
import { cropInfoService } from '@/services/cropInfo/cropInfoService';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { EmptyState } from '@/components/empty-states/EmptyState';

const CATEGORIES = [
  { id: 'ALL', label: 'All Crops' },
  { id: 'Cereal', label: 'Cereals & Millets' },
  { id: 'Pulse', label: 'Pulses & Legumes' },
  { id: 'Vegetable', label: 'Vegetables & Tubers' },
  { id: 'Commercial', label: 'Commercial & Cash' },
  { id: 'Spice', label: 'Spices & Condiments' },
  { id: 'Plantation', label: 'Plantation & Fruit' },
];

export function CropListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'ALL';

  const [crops, setCrops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [activeQuery, setActiveQuery] = useState(urlQuery);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize when URL query param changes (e.g. from Navbar search)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'ALL';
    setSearchInput(q);
    setActiveQuery(q);
    setSelectedCategory(cat);
  }, [searchParams]);

  // Trigger search on Enter press or form submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setActiveQuery(trimmed);

    const newParams = {};
    if (trimmed) newParams.q = trimmed;
    if (selectedCategory && selectedCategory !== 'ALL') newParams.category = selectedCategory;
    setSearchParams(newParams);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const newParams = {};
    if (activeQuery) newParams.q = activeQuery;
    if (catId && catId !== 'ALL') newParams.category = catId;
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    const newParams = {};
    if (selectedCategory && selectedCategory !== 'ALL') newParams.category = selectedCategory;
    setSearchParams(newParams);
  };

  const handleResetAll = () => {
    setSearchInput('');
    setActiveQuery('');
    setSelectedCategory('ALL');
    setSearchParams({});
  };

  useEffect(() => {
    async function loadCrops() {
      setIsLoading(true);
      try {
        let res;
        if (activeQuery) {
          res = await cropInfoService.searchCrops(activeQuery, selectedCategory);
        } else {
          res = await cropInfoService.getFeaturedCrops(selectedCategory);
        }
        setCrops(Array.isArray(res) ? res : (res?.crops || []));
      } catch (err) {
        console.error('Failed to load crop info:', err);
        setCrops([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCrops();
  }, [activeQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Crop Agronomy Guide' }]} />

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ICAR & Agricultural University Agronomic Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-600 shrink-0" />
            <span>Crop Encyclopedia & Agronomy Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Authentic scientific datasheets, day-by-day phenological lifecycles, disease diagnostic guides, organic treatments, and live Mandi price linkages.
          </p>
        </div>

        {/* Enter-key only Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search by crop, Kannada, or scientific name..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft-sm transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="md"
            className="rounded-2xl px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold shrink-0 shadow-soft-sm"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-soft-sm scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active Search / Category Notification */}
      {(activeQuery || selectedCategory !== 'ALL') && (
        <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs">
          <span className="text-emerald-950 font-medium">
            Showing results {activeQuery && <span>for <strong className="font-bold text-brand-700">"{activeQuery}"</strong></span>}
            {selectedCategory !== 'ALL' && <span> in <strong className="font-bold text-slate-800">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong></span>}
            {' '}({crops.length} {crops.length === 1 ? 'crop guide' : 'crop guides'} available)
          </span>
          <button
            type="button"
            onClick={handleResetAll}
            className="text-emerald-700 font-bold hover:text-emerald-900 underline ml-2 cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Crop Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner text="Loading comprehensive agricultural guides..." />
        </div>
      ) : crops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <Link
              key={crop.id}
              to={`/crops/${crop.id}`}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md hover:border-brand-400 transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
            >
              {/* Card Image with Badges */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={
                    crop.imageUrl ||
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={crop.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Top Badge: Category */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/60 shadow-soft-sm flex items-center gap-1">
                    <Tag className="w-3 h-3 text-brand-600" />
                    <span>{crop.category || 'Produce'}</span>
                  </span>
                </div>

                {/* Bottom Overlay: Kannada Local Name Badge */}
                {crop.localNames?.kannada && (
                  <div className="absolute bottom-2.5 right-3 bg-black/75 backdrop-blur-md text-amber-300 font-bold px-2.5 py-0.5 rounded-lg text-xs shadow-soft-sm">
                    {crop.localNames.kannada}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-brand-700 transition-colors leading-snug">
                    {crop.cropName}
                  </h3>
                  {crop.scientificName && (
                    <p className="text-xs italic text-emerald-700 font-semibold mt-0.5">
                      {crop.scientificName}
                    </p>
                  )}
                  {crop.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {crop.description}
                    </p>
                  )}
                </div>

                {/* Agronomic Quick Highlights */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-purple-600" />
                      {crop.growingDuration || `${crop.growthDurationDays || 120} Days`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      <Droplets className="w-3 h-3 text-sky-600" />
                      {crop.waterRequirement?.split(' ')[0] || 'Moderate'}
                    </span>
                  </div>

                  {/* Live Mandi Rate Indicator if Available */}
                  {crop.liveMandiPrice?.modalPrice ? (
                    <div className="flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200/80 px-2.5 py-1.5 rounded-xl font-bold text-amber-900">
                      <span className="flex items-center gap-1 text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>Live Mandi:</span>
                      </span>
                      <span className="text-emerald-700">₹{crop.liveMandiPrice.modalPrice.toLocaleString()}/Qtl</span>
                    </div>
                  ) : null}

                  {/* CTA link */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
                    <span>Full Agronomy Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sprout}
          title="No crop guides found"
          description={
            activeQuery
              ? `No crop guide matching "${activeQuery}". Try searching for Rice, Wheat, Tomato, Coffee, Turmeric, or Ragi.`
              : 'Try selecting another category or searching with a different crop name.'
          }
          actionLabel="View All Crops"
          onAction={handleResetAll}
        />
      )}
    </div>
  );
}
