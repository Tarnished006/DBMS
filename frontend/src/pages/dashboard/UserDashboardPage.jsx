import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  Layers,
  Boxes,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Smartphone,
  Truck,
  ClipboardList,
  Bell,
  Handshake,
  Eye,
  Edit,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react';
import { userService } from '@/services/user/userService';
import { addressService } from '@/services/address/addressService';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';

export function UserDashboardPage() {
  const { user, userMode } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [dashboardData, setDashboardData] = useState(null);
  const [addressCount, setAddressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isBuyer = userMode === 'BUYER';

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, addrsRes] = await Promise.allSettled([
          userService.getUserDashboard(),
          addressService.getUserAddresses(),
        ]);

        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value);
        }

        if (addrsRes.status === 'fulfilled' && Array.isArray(addrsRes.value)) {
          setAddressCount(addrsRes.value.length);
        } else if (dashRes.status === 'fulfilled') {
          setAddressCount(dashRes.value?.total_addresses ?? dashRes.value?.totalAddresses ?? 0);
        }
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner text="Loading dashboard metrics..." />
      </div>
    );
  }

  const buying = dashboardData?.buying || {};
  const selling = dashboardData?.selling || {};
  const recentSellingProducts = selling.recent_products || selling.recentProducts || [];
  const recentBuyerOrders = buying.recent_orders || buying.recentOrders || dashboardData?.recentOrders || [];
  const buyerNegotiations = buying.recent_negotiations || buying.recentNegotiations || [];
  const farmerNegotiations = selling.recent_negotiations || selling.recentNegotiations || [];
  const customerOrders = selling.customer_orders || selling.customerOrders || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Phone Verification Notice Banner (If Unverified) */}
      {!user?.phoneVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Phone Verification Recommended</h4>
              <p className="text-xs text-slate-600">
                Verify your mobile number via SMS OTP to unlock instant order tracking and verified badge status.
              </p>
            </div>
          </div>
          <Link to="/profile" className="flex-shrink-0">
            <Button size="sm" variant={isBuyer ? 'primary' : 'earth'}>
              Verify Phone Number
            </Button>
          </Link>
        </div>
      )}

      {/* Real-time Order & Bargain Action Banner if unread alerts exist */}
      {unreadCount > 0 && notifications.length > 0 && (
        <div className="p-4 sm:p-4.5 rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-100/30 shadow-soft-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-soft-xs">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                  Action Needed ({unreadCount} New)
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {notifications.find((n) => !n.isRead)?.title}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {notifications.find((n) => !n.isRead)?.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <Link
              to={notifications.find((n) => !n.isRead)?.link || '/dashboard/negotiations'}
              onClick={() => {
                const first = notifications.find((n) => !n.isRead);
                if (first) markAsRead(first.id);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-soft-xs hover:shadow-soft-sm transition-all flex items-center gap-1.5"
            >
              <span>Review Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Role Context Notification Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-soft-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          isBuyer
            ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-blue-100/30 border-blue-200'
            : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-100/30 border-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-soft-xs ${
              isBuyer ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isBuyer ? '🛒' : '🚜'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isBuyer ? 'Wholesale Buyer Account' : 'Farmer / Grower Account'}
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isBuyer
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isBuyer ? 'Bulk Sourcing & Direct Bargains' : 'Selling & Mandi Rates'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {isBuyer
                ? 'Your account is configured for bulk crop procurement, transporter tracking, and direct farmer bargains.'
                : 'Your account is configured for produce listings, incoming buyer orders, and live APMC market prices.'}
            </p>
          </div>
        </div>

        {isBuyer ? (
          <Link
            to="/marketplace"
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-soft-xs hover:shadow-soft-sm transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Marketplace</span>
          </Link>
        ) : (
          <Link
            to="/sell"
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-soft-xs hover:shadow-soft-sm transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ List New Crop</span>
          </Link>
        )}
      </div>

      {/* =========================================================================
          BUYER VIEW: Focused strictly on Procurement, Bargains, Demands, and Logistics
          ========================================================================= */}
      {isBuyer ? (
        <>
          {/* Buyer Quick Actions Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/marketplace"
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-soft-sm hover:shadow-soft-md hover:scale-[1.02] transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>Marketplace</span>
                  <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-blue-100 mt-0.5 leading-snug">
                  Browse fresh farm crops
                </p>
              </div>
            </Link>

            <Link
              to="/demands"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-xs hover:border-purple-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Post Demand</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Request crops in bulk
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/negotiations?tab=buyer"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-xs hover:border-emerald-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Price Offers</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Active farmer bargains
                </p>
              </div>
            </Link>

            <Link
              to="/market-prices"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-xs hover:border-amber-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Mandi Rates</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  APMC price benchmarks
                </p>
              </div>
            </Link>
          </div>

          {/* Key Procurement Metrics Grid */}
          <div className="space-y-4 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-lg text-slate-900">Procurement & Order Status</h2>
              </div>
              <Link
                to="/orders"
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Orders */}
              <Link
                to="/orders"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Total Purchases
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{buying.total_orders ?? buying.totalOrders ?? 0}</span>
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  All wholesale orders
                </p>
              </Link>

              {/* Card 2: Active In Transit */}
              <Link
                to="/orders?status=ACTIVE"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Active In Transit
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{buying.active_orders ?? buying.activeOrders ?? 0}</span>
                    <span className="text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Dispatched & Out for delivery
                </p>
              </Link>

              {/* Card 3: Delivered */}
              <Link
                to="/orders?status=DELIVERED"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Delivered
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{buying.delivered_orders ?? buying.deliveredOrders ?? 0}</span>
                    <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Completed handovers
                </p>
              </Link>

              {/* Card 4: Active Negotiations */}
              <Link
                to="/dashboard/negotiations?tab=buyer"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Active Bargains
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Handshake className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{buying.active_negotiations ?? buyerNegotiations.length}</span>
                    <span className="text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Direct price offers
                </p>
              </Link>
            </div>
          </div>

          {/* Active Price Bargains Deck */}
          {buyerNegotiations.length > 0 && (
            <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span>🤝 Direct Price Bargains with Farmers</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {buyerNegotiations.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Negotiate wholesale volume rates directly with farm growers without broker cuts.
                  </p>
                </div>
                <Link
                  to="/dashboard/negotiations?tab=buyer"
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <span>View All Negotiations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid gap-3">
                {buyerNegotiations.slice(0, 3).map((neg) => {
                  const isCountered = neg.status === 'COUNTERED';
                  const isAccepted = neg.status === 'ACCEPTED';

                  return (
                    <div
                      key={neg.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700'
                              : isCountered
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <Handshake className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {neg.produceName}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isCountered
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {neg.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Farmer: <span className="font-semibold text-slate-800">{neg.farmerName}</span> • Requested:{' '}
                            <span className="font-semibold text-slate-800">
                              {neg.quantity} {neg.unit || 'KG'} @ ₹{neg.proposedPrice}/{neg.unit || 'KG'}
                            </span>
                            {isCountered && (
                              <span className="text-blue-700 font-bold ml-2">
                                (Farmer counter: ₹{neg.counterPrice}/{neg.unit || 'KG'})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link to="/dashboard/negotiations?tab=buyer">
                          <Button size="sm" variant={isAccepted ? 'earth' : 'primary'} className="text-xs py-1.5 px-3">
                            {isAccepted ? 'Checkout Deal' : isCountered ? 'Review Counter' : 'View Status'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Purchases & Shipments Deck */}
          <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span>📦 Recent Purchases & Shipments</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {recentBuyerOrders.length} Recent
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live updates on wholesale dispatches, transporter movement, and delivery confirmations.
                </p>
              </div>
              <Link
                to="/orders"
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <span>View All Orders ({buying.total_orders ?? buying.totalOrders ?? 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBuyerOrders.length > 0 ? (
              <div className="grid gap-3">
                {recentBuyerOrders.map((order) => {
                  const orderId = order.id;
                  const displayId = order.id.startsWith('order-') ? order.id : `AGR-${order.id.slice(0, 8).toUpperCase()}`;
                  const itemsList = order.items || [];
                  const firstItem = itemsList[0];
                  const remainingCount = Math.max(0, itemsList.length - 1);
                  const status = order.status;

                  return (
                    <div
                      key={orderId}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {displayId}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            {firstItem ? (
                              <>
                                <span className="font-semibold text-slate-800">{firstItem.productName}</span>
                                <span> ({firstItem.quantity} units)</span>
                                {remainingCount > 0 && <span className="text-slate-400"> +{remainingCount} more item(s)</span>}
                              </>
                            ) : (
                              'Wholesale Farm Produce Order'
                            )}
                          </p>
                          {order.delivery?.carrierName && (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-slate-400" />
                              <span>{order.delivery.carrierName} ({order.delivery.trackingNumber})</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-slate-400 font-medium">Order Total</div>
                          <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                            ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/orders/${orderId}/track`}>
                            <Button size="sm" variant="earth" className="text-xs py-1.5 px-3">
                              Track
                            </Button>
                          </Link>
                          <Link to={`/orders/${orderId}`}>
                            <Button size="sm" variant="outline" className="text-xs py-1.5 px-3">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-800">No purchase orders yet</h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Browse direct farm crops and place wholesale procurement orders with transparent mandi rates.
                </p>
                <Link to="/marketplace" className="inline-block mt-3">
                  <Button size="sm" variant="primary" icon={ShoppingBag}>
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Buyer Services & Logistics Management */}
          <div className="space-y-4 pt-6 border-t border-slate-200/80">
            <h3 className="font-bold text-base text-slate-900">Buyer Tools & Facilities</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/dashboard/locations"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-blue-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>Delivery & Warehouse Addresses ({addressCount})</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Manage unloading docks, warehouse pins, and retail store delivery destinations.
                  </p>
                </div>
              </Link>

              <Link
                to="/pools"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-sky-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>Produce Freight Pools</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Source consolidated village produce lots with shared vehicle transport to lower freight costs.
                  </p>
                </div>
              </Link>

              <Link
                to="/market-prices"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-amber-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>APMC Mandi Price Benchmarks</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Verify government mandi rates across districts before finalizing negotiations with farmers.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
           FARMER VIEW: Focused strictly on Crop Listings, Sales, Inventory & Agronomy
           ========================================================================= */
        <>
          {/* Farmer Quick Actions Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/sell"
              className="p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-700 text-white shadow-soft-sm hover:shadow-soft-md hover:scale-[1.02] transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>+ Sell Crop</span>
                  <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-emerald-100 mt-0.5 leading-snug">
                  Post fresh harvest
                </p>
              </div>
            </Link>

            <Link
              to="/market-prices"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-xs hover:border-emerald-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Mandi Prices</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Live APMC rates & trends
                </p>
              </div>
            </Link>

            <Link
              to="/pools"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-xs hover:border-sky-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Produce Pools</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Shared vehicle transport
                </p>
              </div>
            </Link>

            <Link
              to="/demands"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-xs hover:border-purple-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Buyer Demands</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Direct buyer requests
                </p>
              </div>
            </Link>
          </div>

          {/* Key Farm Sales Metrics Grid */}
          <div className="space-y-4 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-earth-50 text-earth-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-lg text-slate-900">Farm Listings & Sales Overview</h2>
              </div>
              <Link to="/sell">
                <Button size="sm" variant="earth" icon={PlusCircle}>
                  List New Produce
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Products */}
              <Link
                to="/dashboard/selling"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-earth-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Total Products
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-earth-50 text-earth-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{selling.total_products ?? selling.totalProducts ?? 0}</span>
                    <span className="text-xs font-semibold text-earth-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Catalogued produce
                </p>
              </Link>

              {/* Card 2: Active in Market */}
              <Link
                to="/dashboard/selling"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Active in Market
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{selling.active_products ?? selling.activeProducts ?? 0}</span>
                    <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Available for wholesale purchase
                </p>
              </Link>

              {/* Card 3: Customer Orders */}
              <Link
                to="/orders?tab=customer"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Customer Orders
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{selling.total_product_orders ?? selling.totalProductOrders ?? 0}</span>
                    <span className="text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Orders placed on your crops
                </p>
              </Link>

              {/* Card 4: Stock Batches */}
              <Link
                to="/dashboard/inventory"
                className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                      Stock Batches
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Boxes className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                    <span>{selling.inventory_items ?? selling.inventoryItems ?? 0}</span>
                    <span className="text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
                  Tracked inventory lines
                </p>
              </Link>
            </div>
          </div>

          {/* Active Farm Listings & Harvests Deck */}
          <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span>🌾 Active Farm Listings & Harvests</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-earth-100 text-earth-800 border border-earth-200">
                    {recentSellingProducts.length} Lots Live
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live farm inventory currently visible to wholesale buyers and institutional procurers.
                </p>
              </div>
              <Link
                to="/dashboard/selling"
                className="text-xs font-bold text-earth-700 hover:text-earth-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <span>View All Products ({selling.total_products ?? selling.totalProducts ?? 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentSellingProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {recentSellingProducts.slice(0, 6).map((prod) => {
                  const isPreHarvest = prod.harvestStatus === 'PRE_HARVEST_CONTRACT';
                  const imgUrl = prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-earth-400 transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="p-3.5">
                        <div className="relative mb-3 rounded-xl overflow-hidden bg-slate-100 aspect-[16/9]">
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${
                                isPreHarvest
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isPreHarvest ? '🌾 Pre-Harvest' : '🌿 Ready to Ship'}
                            </span>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                            {prod.quantity} {prod.unit}
                          </div>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-earth-700 transition-colors">
                          {prod.name}
                        </h4>

                        <div className="flex items-center justify-between mt-1 text-xs">
                          <div className="font-extrabold text-slate-900 text-sm">
                            ₹{prod.price} <span className="text-[10px] font-normal text-slate-500">/{prod.unit}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{prod.location}</span>
                          </div>
                        </div>

                        {isPreHarvest && prod.expectedHarvestDate && (
                          <div className="mt-2 text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Harvest Est: {prod.expectedHarvestDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/products/${prod.id}`}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/dashboard/selling/edit/${prod.id}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-earth-700 bg-earth-50 hover:bg-earth-100 border border-earth-200/80 transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>
                          <Link
                            to="/dashboard/inventory"
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                          >
                            Stock
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-800">No active produce listed</h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  List your harvested crops or pre-harvest contracts to begin selling directly to wholesale buyers.
                </p>
                <Link to="/sell" className="inline-block mt-3">
                  <Button size="sm" variant="earth" icon={PlusCircle}>
                    + List Your First Crop
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Incoming Buyer Bargains Deck */}
          {farmerNegotiations.length > 0 && (
            <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span>🤝 Incoming Wholesale Offers from Buyers</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {farmerNegotiations.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wholesale buyers requesting bulk quantity pricing on your farm listings.
                  </p>
                </div>
                <Link
                  to="/dashboard/negotiations?tab=farmer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <span>View All Offers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid gap-3">
                {farmerNegotiations.slice(0, 3).map((neg) => {
                  const isCountered = neg.status === 'COUNTERED';
                  const isAccepted = neg.status === 'ACCEPTED';

                  return (
                    <div
                      key={neg.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-emerald-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700'
                              : isCountered
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <Handshake className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {neg.produceName}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isCountered
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {neg.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Buyer: <span className="font-semibold text-slate-800">{neg.buyerName}</span> • Requested:{' '}
                            <span className="font-semibold text-slate-800">
                              {neg.quantity} {neg.unit || 'KG'} @ ₹{neg.proposedPrice}/{neg.unit || 'KG'}
                            </span>
                            {isCountered && (
                              <span className="text-blue-700 font-bold ml-2">
                                (Your counter: ₹{neg.counterPrice}/{neg.unit || 'KG'})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link to="/dashboard/negotiations?tab=farmer">
                          <Button size="sm" variant="earth" className="text-xs py-1.5 px-3">
                            {neg.status === 'PENDING' ? 'Counter / Accept' : 'Manage Offer'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incoming Customer Orders Deck */}
          {customerOrders.length > 0 && (
            <div className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span>📦 Orders Received from Buyers</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      {customerOrders.length} Recent
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orders placed on your farm crops requiring loading and dispatch.
                  </p>
                </div>
                <Link
                  to="/orders?tab=customer"
                  className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <span>View All Customer Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid gap-3">
                {customerOrders.map((order) => {
                  const displayId = order.id.startsWith('order-') ? order.id : `AGR-${order.id.slice(0, 8).toUpperCase()}`;
                  const itemsList = order.items || [];
                  const firstItem = itemsList[0];

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-purple-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {displayId}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Buyer: <span className="font-semibold text-slate-800">{order.customerName}</span>
                            {firstItem && (
                              <span> • {firstItem.productName} ({firstItem.quantity} units)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-slate-400 font-medium">Order Total</div>
                          <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                            ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <Link to={`/orders/${order.id}`}>
                          <Button size="sm" variant="earth" className="text-xs py-1.5 px-3">
                            View Order
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Farmer Services & Field Management */}
          <div className="space-y-4 pt-6 border-t border-slate-200/80">
            <h3 className="font-bold text-base text-slate-900">Farmer Field & Logistics Services</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/dashboard/inventory"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-brand-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>Manage Stock & Quantities</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Update physical quantities, set reserve amounts, and prevent stock-outs.
                  </p>
                </div>
              </Link>

              <Link
                to="/weather"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-earth-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-earth-50 text-earth-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>Weather & Agronomy Risks</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-earth-700 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Check spraying conditions, rainfall forecasts, and field-level agronomic advisories.
                  </p>
                </div>
              </Link>

              <Link
                to="/dashboard/locations"
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-blue-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>Farm Gate Pickup Pins ({addressCount})</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Set precise farm gate GPS pins for truck transporters to navigate directly to your field.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
