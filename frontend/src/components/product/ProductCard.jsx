import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, CheckCircle2, AlertCircle, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatQuantity } from '@/utils/formatters';
import { Button } from '@/components/common/Button';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Find primary image or first available image
  const primaryImage =
    product.images?.find((img) => img.primary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600';

  const isAvailable = product.quantity > 0 && product.status === 'ACTIVE';

  const handleNavigateToProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-brand-300 transition-all duration-300 overflow-hidden h-full">
      {/* Image Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleNavigateToProduct}
        onKeyDown={(e) => e.key === 'Enter' && handleNavigateToProduct(e)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600';
          }}
        />

        {/* Category Badge */}
        {product.categoryName && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white/95 text-brand-800 backdrop-blur-md shadow-soft-xs border border-white/60">
              {product.categoryName}
            </span>
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-sm shadow-soft-xs">
              <CheckCircle2 className="w-3 h-3" /> In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-600/90 text-white backdrop-blur-sm shadow-soft-xs">
              <AlertCircle className="w-3 h-3" /> Out of Stock
            </span>
          )}
        </div>

        {/* Product Trust / Certified Badge */}
        {product.badge && (
          <div className="absolute bottom-2.5 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-slate-900/85 text-white backdrop-blur-md shadow-sm border border-white/20">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-4 justify-between gap-2.5">
        <div className="space-y-1.5">
          {/* Seller / Producer & Location */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            {product.sellerName ? (
              <div className="flex items-center gap-1 text-brand-700 font-semibold truncate max-w-[65%]">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="truncate">{product.sellerName}</span>
              </div>
            ) : <div />}

            {product.location && (
              <div className="flex items-center gap-0.5 text-slate-400 truncate max-w-[35%] justify-end">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{product.location}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleNavigateToProduct}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigateToProduct(e)}
            className="block group-hover:text-brand-700 transition-colors cursor-pointer"
          >
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
              {product.name}
            </h3>
          </div>

          {/* Short Description */}
          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
              {product.description}
            </p>
          )}

          {/* Mandi Price Link Indicator */}
          {(product.isMandiLinked || product.mandiLinkedCommodity) && (
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Zap className="w-3 h-3 text-amber-600 flex-shrink-0" />
                Agmarknet Mandi Indexed
              </span>
            </div>
          )}
        </div>

        {/* Price & Stock Section */}
        <div className="pt-2.5 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/{product.unit || 'unit'}</span>
          </div>

          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 whitespace-nowrap">
            {formatQuantity(product.quantity, product.unit)}
          </span>
        </div>

        {/* Full-Width Action Button (No Eye Icon, Clean & Prominent) */}
        <div className="pt-1">
          <Button
            size="sm"
            variant="primary"
            disabled={!isAvailable}
            onClick={handleNavigateToProduct}
            icon={ShoppingBag}
            className="w-full justify-center py-2.5 text-xs sm:text-sm font-bold shadow-soft-sm tracking-wide rounded-xl"
          >
            {isAvailable ? 'View & Buy' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}
