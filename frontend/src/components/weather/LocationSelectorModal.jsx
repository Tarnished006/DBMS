import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Check,
  X,
  Map,
  Globe2,
  Loader2,
} from 'lucide-react';
import { weatherService } from '@/services/weather/weatherService';

// Comprehensive agricultural hubs across all Indian states and union territories
export const ALL_INDIA_AGRICULTURAL_DISTRICTS = [
  // 1. Karnataka
  { city: 'Vijayapura', state: 'Karnataka', region: 'Karnataka', latitude: 16.8302, longitude: 75.7100 },
  { city: 'Belagavi', state: 'Karnataka', region: 'Karnataka', latitude: 15.8497, longitude: 74.4977 },
  { city: 'Hubballi-Dharwad', state: 'Karnataka', region: 'Karnataka', latitude: 15.3647, longitude: 75.1240 },
  { city: 'Bagalkote', state: 'Karnataka', region: 'Karnataka', latitude: 16.1875, longitude: 75.6980 },
  { city: 'Kalaburagi', state: 'Karnataka', region: 'Karnataka', latitude: 17.3297, longitude: 76.8343 },
  { city: 'Raichur', state: 'Karnataka', region: 'Karnataka', latitude: 16.2076, longitude: 77.3463 },
  { city: 'Ballari', state: 'Karnataka', region: 'Karnataka', latitude: 15.1394, longitude: 76.9214 },
  { city: 'Shivamogga', state: 'Karnataka', region: 'Karnataka', latitude: 13.9299, longitude: 75.5681 },
  { city: 'Davanagere', state: 'Karnataka', region: 'Karnataka', latitude: 14.4644, longitude: 75.9218 },
  { city: 'Chitradurga', state: 'Karnataka', region: 'Karnataka', latitude: 14.2251, longitude: 76.3980 },
  { city: 'Hassan', state: 'Karnataka', region: 'Karnataka', latitude: 13.0033, longitude: 76.1004 },
  { city: 'Mysuru', state: 'Karnataka', region: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { city: 'Mandya', state: 'Karnataka', region: 'Karnataka', latitude: 12.5218, longitude: 76.8951 },
  { city: 'Tumakuru', state: 'Karnataka', region: 'Karnataka', latitude: 13.3409, longitude: 77.1010 },
  { city: 'Kolar', state: 'Karnataka', region: 'Karnataka', latitude: 13.1367, longitude: 78.1340 },
  { city: 'Chikkamagaluru', state: 'Karnataka', region: 'Karnataka', latitude: 13.3161, longitude: 75.7720 },
  { city: 'Udupi', state: 'Karnataka', region: 'Karnataka', latitude: 13.3409, longitude: 74.7421 },
  { city: 'Mangaluru', state: 'Karnataka', region: 'Karnataka', latitude: 12.9141, longitude: 74.8560 },
  { city: 'Bengaluru Urban', state: 'Karnataka', region: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },

  // 2. Maharashtra
  { city: 'Nashik', state: 'Maharashtra', region: 'Maharashtra', latitude: 20.0112, longitude: 73.7902 },
  { city: 'Pune', state: 'Maharashtra', region: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Nagpur', state: 'Maharashtra', region: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', region: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { city: 'Kolhapur', state: 'Maharashtra', region: 'Maharashtra', latitude: 16.7050, longitude: 74.2433 },
  { city: 'Solapur', state: 'Maharashtra', region: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  { city: 'Ahmednagar', state: 'Maharashtra', region: 'Maharashtra', latitude: 19.0948, longitude: 74.7480 },
  { city: 'Jalgaon', state: 'Maharashtra', region: 'Maharashtra', latitude: 21.0077, longitude: 75.5626 },
  { city: 'Amravati', state: 'Maharashtra', region: 'Maharashtra', latitude: 20.9320, longitude: 77.7523 },
  { city: 'Latur', state: 'Maharashtra', region: 'Maharashtra', latitude: 18.4088, longitude: 76.5604 },
  { city: 'Sangli', state: 'Maharashtra', region: 'Maharashtra', latitude: 16.8524, longitude: 74.5815 },

  // 3. Punjab & Haryana
  { city: 'Ludhiana', state: 'Punjab', region: 'Punjab & Haryana', latitude: 30.9010, longitude: 75.8573 },
  { city: 'Amritsar', state: 'Punjab', region: 'Punjab & Haryana', latitude: 31.6340, longitude: 74.8723 },
  { city: 'Jalandhar', state: 'Punjab', region: 'Punjab & Haryana', latitude: 31.3260, longitude: 75.5762 },
  { city: 'Bathinda', state: 'Punjab', region: 'Punjab & Haryana', latitude: 30.2110, longitude: 74.9455 },
  { city: 'Patiala', state: 'Punjab', region: 'Punjab & Haryana', latitude: 30.3398, longitude: 76.3869 },
  { city: 'Karnal', state: 'Haryana', region: 'Punjab & Haryana', latitude: 29.6857, longitude: 76.9905 },
  { city: 'Hisar', state: 'Haryana', region: 'Punjab & Haryana', latitude: 29.1492, longitude: 75.7217 },
  { city: 'Ambala', state: 'Haryana', region: 'Punjab & Haryana', latitude: 30.3782, longitude: 76.7767 },
  { city: 'Sirsa', state: 'Haryana', region: 'Punjab & Haryana', latitude: 29.5349, longitude: 75.0289 },
  { city: 'Rohtak', state: 'Haryana', region: 'Punjab & Haryana', latitude: 28.8955, longitude: 76.6066 },

  // 4. Uttar Pradesh
  { city: 'Varanasi', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { city: 'Lucknow', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { city: 'Kanpur', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { city: 'Agra', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { city: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8463 },
  { city: 'Meerut', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
  { city: 'Bareilly', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304 },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 26.7606, longitude: 83.3732 },
  { city: 'Aligarh', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 27.8974, longitude: 78.0880 },
  { city: 'Muzaffarnagar', state: 'Uttar Pradesh', region: 'Uttar Pradesh', latitude: 29.4727, longitude: 77.7085 },

  // 5. Madhya Pradesh
  { city: 'Indore', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { city: 'Bhopal', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { city: 'Ujjain', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 23.1765, longitude: 75.7885 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
  { city: 'Gwalior', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
  { city: 'Sagar', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 23.8388, longitude: 78.7378 },
  { city: 'Ratlam', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 23.3315, longitude: 75.0367 },
  { city: 'Hoshangabad (Narmadapuram)', state: 'Madhya Pradesh', region: 'Madhya Pradesh', latitude: 22.7519, longitude: 77.7289 },

  // 6. Gujarat
  { city: 'Ahmedabad', state: 'Gujarat', region: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { city: 'Rajkot', state: 'Gujarat', region: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { city: 'Surat', state: 'Gujarat', region: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { city: 'Vadodara', state: 'Gujarat', region: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { city: 'Bhavnagar', state: 'Gujarat', region: 'Gujarat', latitude: 21.7645, longitude: 72.1519 },
  { city: 'Junagadh', state: 'Gujarat', region: 'Gujarat', latitude: 21.5222, longitude: 70.4579 },
  { city: 'Mehsana', state: 'Gujarat', region: 'Gujarat', latitude: 23.5880, longitude: 72.3693 },
  { city: 'Anand', state: 'Gujarat', region: 'Gujarat', latitude: 22.5645, longitude: 72.9289 },

  // 7. Rajasthan
  { city: 'Jaipur', state: 'Rajasthan', region: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { city: 'Jodhpur', state: 'Rajasthan', region: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { city: 'Kota', state: 'Rajasthan', region: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { city: 'Bikaner', state: 'Rajasthan', region: 'Rajasthan', latitude: 28.0229, longitude: 73.3119 },
  { city: 'Udaipur', state: 'Rajasthan', region: 'Rajasthan', latitude: 24.5854, longitude: 73.7125 },
  { city: 'Sri Ganganagar', state: 'Rajasthan', region: 'Rajasthan', latitude: 29.9094, longitude: 73.8799 },
  { city: 'Alwar', state: 'Rajasthan', region: 'Rajasthan', latitude: 27.5530, longitude: 76.6346 },

  // 8. Tamil Nadu
  { city: 'Coimbatore', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { city: 'Madurai', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { city: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047 },
  { city: 'Salem', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460 },
  { city: 'Thanjavur', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 10.7870, longitude: 79.1378 },
  { city: 'Erode', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 11.3410, longitude: 77.7172 },
  { city: 'Tirunelveli', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 8.7139, longitude: 77.7567 },
  { city: 'Chennai', state: 'Tamil Nadu', region: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },

  // 9. Andhra Pradesh & Telangana
  { city: 'Vijayawada', state: 'Andhra Pradesh', region: 'Andhra & Telangana', latitude: 16.5062, longitude: 80.6480 },
  { city: 'Guntur', state: 'Andhra Pradesh', region: 'Andhra & Telangana', latitude: 16.3067, longitude: 80.4365 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'Andhra & Telangana', latitude: 17.6868, longitude: 83.2185 },
  { city: 'Kurnool', state: 'Andhra Pradesh', region: 'Andhra & Telangana', latitude: 15.8281, longitude: 78.0373 },
  { city: 'Tirupati', state: 'Andhra Pradesh', region: 'Andhra & Telangana', latitude: 13.6288, longitude: 79.4192 },
  { city: 'Anantapur', state: 'Andhra Pradesh', region: 'Andhra & Telangana', latitude: 14.6819, longitude: 77.6006 },
  { city: 'Hyderabad', state: 'Telangana', region: 'Andhra & Telangana', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Warangal', state: 'Telangana', region: 'Andhra & Telangana', latitude: 17.9689, longitude: 79.5941 },
  { city: 'Nizamabad', state: 'Telangana', region: 'Andhra & Telangana', latitude: 18.6725, longitude: 78.0941 },
  { city: 'Karimnagar', state: 'Telangana', region: 'Andhra & Telangana', latitude: 18.4386, longitude: 79.1288 },

  // 10. Kerala
  { city: 'Wayanad (Kalpetta)', state: 'Kerala', region: 'Other States', latitude: 11.6103, longitude: 76.0828 },
  { city: 'Palakkad', state: 'Kerala', region: 'Other States', latitude: 10.7867, longitude: 76.6548 },
  { city: 'Kozhikode', state: 'Kerala', region: 'Other States', latitude: 11.2588, longitude: 75.7804 },
  { city: 'Kochi', state: 'Kerala', region: 'Other States', latitude: 9.9312, longitude: 76.2673 },
  { city: 'Idukki (Painavu)', state: 'Kerala', region: 'Other States', latitude: 9.8500, longitude: 76.9700 },

  // 11. Eastern & North Eastern States
  { city: 'Burdwan (Purba Bardhaman)', state: 'West Bengal', region: 'Other States', latitude: 23.2324, longitude: 87.8615 },
  { city: 'Siliguri', state: 'West Bengal', region: 'Other States', latitude: 26.7271, longitude: 88.3953 },
  { city: 'Kolkata', state: 'West Bengal', region: 'Other States', latitude: 22.5726, longitude: 88.3639 },
  { city: 'Patna', state: 'Bihar', region: 'Other States', latitude: 25.5941, longitude: 85.1376 },
  { city: 'Muzaffarpur', state: 'Bihar', region: 'Other States', latitude: 26.1209, longitude: 85.3647 },
  { city: 'Bhubaneswar', state: 'Odisha', region: 'Other States', latitude: 20.2961, longitude: 85.8245 },
  { city: 'Sambalpur', state: 'Odisha', region: 'Other States', latitude: 21.4669, longitude: 83.9812 },
  { city: 'Raipur', state: 'Chhattisgarh', region: 'Other States', latitude: 21.2514, longitude: 81.6296 },
  { city: 'Ranchi', state: 'Jharkhand', region: 'Other States', latitude: 23.3441, longitude: 85.3096 },
  { city: 'Guwahati', state: 'Assam', region: 'Other States', latitude: 26.1445, longitude: 91.7362 },

  // 12. Northern Hills & National Capital
  { city: 'New Delhi', state: 'Delhi NCR', region: 'Other States', latitude: 28.6139, longitude: 77.2090 },
  { city: 'Dehradun', state: 'Uttarakhand', region: 'Other States', latitude: 30.3165, longitude: 78.0322 },
  { city: 'Shimla', state: 'Himachal Pradesh', region: 'Other States', latitude: 31.1048, longitude: 77.1734 },
  { city: 'Srinagar', state: 'Jammu & Kashmir', region: 'Other States', latitude: 34.0837, longitude: 74.7973 },
  { city: 'Jammu', state: 'Jammu & Kashmir', region: 'Other States', latitude: 32.7266, longitude: 74.8570 },
];

export const REGION_FILTERS = [
  'All India',
  'Karnataka',
  'Maharashtra',
  'Punjab & Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Gujarat',
  'Rajasthan',
  'Tamil Nadu',
  'Andhra & Telangana',
  'Other States',
];

export function LocationSelectorModal({
  isOpen,
  onClose,
  currentLat,
  currentLon,
  currentCity,
  onSelectLocation,
  onUseCurrentLocation,
  onOpenMap,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All India');
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  // Live Geocoding Search across all India (Debounced)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setLiveSearchResults([]);
      setIsSearchingLive(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const results = await weatherService.searchLocation(trimmed);
        if (Array.isArray(results)) {
          setLiveSearchResults(results);
        }
      } catch (err) {
        console.warn('Live location search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ALL_INDIA_AGRICULTURAL_DISTRICTS.filter((d) => {
      // Region filter
      if (activeRegion !== 'All India' && d.region !== activeRegion) {
        return false;
      }
      // Text query filter
      if (!q) return true;
      return (
        d.city.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Select Weather Location
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Accurate agricultural weather forecast throughout India
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {/* Quick Actions: GPS & Map Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Live GPS Location */}
            <button
              type="button"
              onClick={() => {
                onUseCurrentLocation();
                onClose();
              }}
              className="py-2.5 px-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 text-left flex items-center gap-2.5 transition-all cursor-pointer shadow-soft-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">
                  Use GPS Location
                </div>
                <div className="text-[10px] text-emerald-700 font-medium truncate">
                  {currentCity || 'Detect my location'}
                </div>
              </div>
            </button>

            {/* 2. Select On Map Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenMap) onOpenMap();
              }}
              className="py-2.5 px-3.5 rounded-2xl bg-brand-50 hover:bg-brand-100/70 border border-brand-200/80 text-left flex items-center gap-2.5 transition-all cursor-pointer shadow-soft-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">
                  Interactive Map
                </div>
                <div className="text-[10px] text-brand-700 font-medium truncate">
                  Drop a pin anywhere in India
                </div>
              </div>
            </button>
          </div>

          {/* Search Input with Live Pan-India Geocoding */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search any Indian city, district, taluk, or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
            {isSearchingLive && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 animate-spin" />
            )}
          </div>

          {/* Region Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {REGION_FILTERS.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setActiveRegion(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeRegion === reg
                    ? 'bg-slate-900 text-white shadow-soft-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Live Geocoding Results (if found) */}
          {liveSearchResults.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-brand-800">
                <span>Live Location Matches ({liveSearchResults.length})</span>
                <span className="text-[9px] bg-brand-200/80 px-1.5 py-0.5 rounded">All India Geocoder</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {liveSearchResults.map((item, idx) => (
                  <button
                    key={`${item.city}-${item.latitude}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation(item.latitude, item.longitude, item.city, item.state);
                      onClose();
                    }}
                    className="text-left p-2 rounded-xl bg-white border border-brand-200 hover:border-brand-500 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-slate-900 truncate">
                        {item.city}
                      </div>
                      <div className="text-[10px] text-brand-700 truncate">
                        {item.state}
                      </div>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curated Agricultural Districts Grid */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1">
              <span>
                {activeRegion === 'All India' ? 'Major Agricultural Hubs' : activeRegion} ({filteredDistricts.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDistricts.map((item) => {
                const isSelected =
                  Math.abs(currentLat - item.latitude) < 0.05 &&
                  Math.abs(currentLon - item.longitude) < 0.05;

                return (
                  <button
                    key={`${item.city}-${item.state}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation(item.latitude, item.longitude, item.city, item.state);
                      onClose();
                    }}
                    className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 shadow-soft-xs'
                        : 'bg-white border-slate-100 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-extrabold text-xs text-slate-800 truncate">
                        {item.city}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {item.state}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-600 stroke-[3] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {filteredDistricts.length === 0 && liveSearchResults.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                No preset district found for "{searchQuery}". You can drop a pin on the map or type any Indian city name!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
