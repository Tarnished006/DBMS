import React, { useState, useEffect } from 'react';
import { Truck, Users, Sparkles, MapPin, ArrowRight, TrendingDown, CheckCircle2 } from 'lucide-react';
import { poolService } from '@/services/pool/poolService';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'react-router-dom';

export function ProducePoolingPage() {
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPools() {
      setIsLoading(true);
      try {
        const data = await poolService.getPools();
        setPools(data || []);
      } catch (err) {
        console.error('Failed to load produce pools:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPools();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-soft-xl relative overflow-hidden">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Truck className="w-4 h-4 text-emerald-400" />
            Shared Logistics & Village Freight Consolidation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Community Produce Pooling
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Individual smallholder farmers in the same Taluk combine their harvests into consolidated truckloads. Cut freight costs by up to <strong>75%</strong> and eliminate village broker monopolies.
          </p>
        </div>
      </div>

      {/* Pools Grid */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" text="Consolidating regional produce clusters..." />
        </div>
      ) : pools.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Truck className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No active produce pools</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            As farmers list crops with verified Taluk locations, clusters will automatically consolidate into shared freight lots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft-xs hover:border-emerald-400 hover:shadow-soft-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                      Village Consolidation Lot
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">{pool.cropName}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {pool.estimatedFreightSavingsPercentage}% Freight Saved
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{pool.talukName}, {pool.districtName}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Total Pooled</span>
                    <strong className="text-slate-900 font-black text-base">
                      {pool.totalQuantity} {pool.unit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Cluster Average</span>
                    <strong className="text-emerald-700 font-black text-base">
                      {formatCurrency(pool.avgPricePerUnit)}/{pool.unit}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-bold">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Aggregated across {pool.participatingFarmersCount} local smallholder farmers</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Single-Truck Dispatch
                </span>
                <Link to="/marketplace">
                  <Button size="sm" variant="outline" icon={ArrowRight}>
                    View Produce
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
