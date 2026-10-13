import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Sprout,
  Menu,
  X,
  User,
  ShoppingBag,
  TrendingUp,
  CloudSun,
  BookOpen,
  Search,
  PlusCircle,
  LogOut,
  ShieldAlert,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Info,
  Globe,
  ClipboardList,
  Truck,
  Handshake,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/common/Button';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, userMode, toggleUserMode } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isCropsPage = location.pathname.startsWith('/crops');
  const isMarketPricesPage = location.pathname.startsWith('/market-prices');
  const isMarketplacePage =
    location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/products');

  const getSearchPlaceholder = () => {
    if (isCropsPage) return 'Search crop guide (press Enter)...';
    if (isMarketPricesPage) return 'Search mandi prices (press Enter)...';
    if (location.pathname === '/') return 'Search products, crops, seeds...';
    return 'Search products (press Enter)...';
  };

  // Sync navbar search input with URL 'q' or 'commodity' query param based on active page
  useEffect(() => {
    if (isMarketplacePage) {
      setSearchQuery(searchParams.get('q') || '');
    } else if (isCropsPage) {
      setSearchQuery(searchParams.get('q') || '');
    } else if (isMarketPricesPage) {
      setSearchQuery(searchParams.get('q') || searchParams.get('commodity') || '');
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, searchParams, isMarketplacePage, isCropsPage, isMarketPricesPage]);

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (isMarketplacePage) {
      navigate('/marketplace');
    } else if (isCropsPage) {
      navigate('/crops');
    } else if (isMarketPricesPage) {
      navigate('/market-prices');
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      handleClearSearch();
      return;
    }

    if (isCropsPage) {
      navigate(`/crops?q=${encodeURIComponent(trimmed)}`);
    } else if (isMarketPricesPage) {
      navigate(`/market-prices?q=${encodeURIComponent(trimmed)}`);
    } else {
      // Home page, Marketplace, and default for all other pages
      navigate(`/marketplace?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const navLinks =
    userMode === 'FARMER'
      ? [
          { to: '/market-prices', label: t('mandiPrices', 'Mandi Prices'), icon: TrendingUp },
          { to: '/pools', label: t('producePools', 'Produce Pools'), icon: Truck },
          { to: '/demands', label: t('demandBoard', 'Buyer Demands'), icon: ClipboardList },
          { to: '/marketplace', label: t('marketplace', 'Marketplace'), icon: ShoppingBag },
          { to: '/crops', label: t('cropGuide', 'Crop Guide'), icon: BookOpen },
          { to: '/weather', label: t('weather', 'Weather'), icon: CloudSun },
        ]
      : [
          { to: '/marketplace', label: t('marketplace', 'Marketplace'), icon: ShoppingBag },
          { to: '/demands', label: t('demandBoard', 'Demand Board'), icon: ClipboardList },
          { to: '/pools', label: t('producePools', 'Produce Pools'), icon: Truck },
          { to: '/market-prices', label: t('mandiPrices', 'Mandi Prices'), icon: TrendingUp },
          { to: '/crops', label: t('cropGuide', 'Crop Guide'), icon: BookOpen },
          { to: '/weather', label: t('weather', 'Weather'), icon: CloudSun },
        ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 w-full">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4 w-full">
          {/* 1. Left Zone: Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-700 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-emerald-800 to-slate-900 bg-clip-text text-transparent">
              AgriMarket
            </span>
          </Link>

          {/* 2. Center Zone: Desktop Navigation Links (flex-shrink-0 to guarantee zero collision) */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 flex-shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* 3. Right Zone: Compact Search, Role Mode, Sell CTA, Language, User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Desktop Sleek Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center relative w-32 xl:w-40 focus-within:w-52 transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 shadow-soft-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Mode Switcher Button (Farmer Mode <-> Buyer Mode) */}
            <button
              type="button"
              onClick={toggleUserMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-soft-xs cursor-pointer flex-shrink-0 ${
                userMode === 'FARMER'
                  ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  : 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800'
              }`}
              title={
                userMode === 'FARMER'
                  ? 'Active: Farmer Mode. Click to switch to Buyer Mode 🛒'
                  : 'Active: Buyer Mode. Click to switch to Farmer Mode 🚜'
              }
            >
              <span className="text-sm">{userMode === 'FARMER' ? '🚜' : '🛒'}</span>
              <span className="hidden sm:inline font-extrabold">
                {userMode === 'FARMER' ? 'Farmer Mode' : 'Buyer Mode'}
              </span>
            </button>

            {/* Prominent Sell Crop CTA for Farmers */}
            {userMode === 'FARMER' && (
              <Link
                to="/sell"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-700 hover:from-brand-700 hover:to-emerald-800 text-white text-xs font-black shadow-soft-sm transition-all hover:scale-105 flex-shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Sell Crop</span>
              </Link>
            )}

            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all shadow-soft-xs cursor-pointer"
              title="Switch Language / ಭಾಷೆ ಬದಲಿಸಿ"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* User Menu: Small Picture Only, No Name */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center justify-center p-0.5 rounded-full border-2 border-slate-200 hover:border-brand-500 hover:shadow-soft-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    aria-label="User profile menu"
                  >
                    <img
                      src={user?.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={user?.fullName || 'User'}
                      className="w-8 h-8 rounded-full object-cover bg-slate-100"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') + '&background=16a34a&color=fff';
                      }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-soft-xl border border-slate-100 z-50 animate-slide-up">
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>

                        {/* Current Mode Badge & Switch Action */}
                        <div className="px-3 py-2 mb-1.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                          <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                            {userMode === 'FARMER' ? '🚜 Farmer' : '🛒 Buyer'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              toggleUserMode();
                              setIsUserDropdownOpen(false);
                            }}
                            className="text-[11px] font-bold text-brand-700 hover:text-brand-900 underline cursor-pointer"
                          >
                            Switch to {userMode === 'FARMER' ? 'Buyer 🛒' : 'Farmer 🚜'}
                          </button>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>User Dashboard</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/dashboard/negotiations"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <Handshake className="w-4 h-4 text-slate-400" />
                          <span>{t('bargains', 'Bargain & Offers')}</span>
                        </Link>

                        <Link
                          to="/dashboard/selling"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>My Listed Products</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Profile & Settings</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border-t border-slate-100 my-1 pt-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-purple-600" />
                              <span>Admin Panel</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                              Admin
                            </span>
                          </Link>
                        )}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-soft-lg">
          {/* Mobile Mode Switcher Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200/90 mb-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{userMode === 'FARMER' ? '🚜' : '🛒'}</span>
              <div>
                <p className="text-xs font-black text-slate-900">
                  {userMode === 'FARMER' ? 'Farmer Mode' : 'Buyer Mode'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {userMode === 'FARMER' ? 'Selling & APMC Mandi rates' : 'Produce & Bulk shopping'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleUserMode}
              className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-slate-200 text-brand-700 hover:bg-brand-50 shadow-soft-xs cursor-pointer"
            >
              Switch ⇄
            </button>
          </div>

          {/* Mobile Sell Crop Quick CTA (Farmer Mode) */}
          {userMode === 'FARMER' && (
            <Link
              to="/sell"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-700 text-white text-xs font-black shadow-soft-sm mb-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Sell Your Crops / Produce</span>
            </Link>
          )}

          {/* Mobile Search Bar */}
          <form
            onSubmit={(e) => {
              setIsMobileMenuOpen(false);
              handleSearchSubmit(e);
            }}
            className="relative pb-2"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100 rounded-xl border border-transparent focus:border-brand-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
            <Link
              to="/support"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Support & Help Center
            </Link>

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors border border-purple-200/80 bg-purple-50/40"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Admin Panel</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-200 text-purple-800">
                  Admin
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
