import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { apiClient } from '@/services/api/apiClient';
import { 
  Network, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  Building2, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';

export function MarketplaceSyncModal({ isOpen, onClose, onSyncComplete }) {
  const [statusData, setStatusData] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSyncFeedback(null);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await apiClient.get('/marketplace/status');
      setStatusData(res.data || res);
    } catch (err) {
      console.error('Failed to load marketplace status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleTriggerMandiSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await apiClient.post('/marketplace/sync-mandi');
      const data = res.data || res;
      setSyncFeedback(data);
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      console.error('Failed to sync mandi prices:', err);
      setSyncFeedback({ success: false, message: 'Sync failed: could not reach APMC price gateway' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Real Marketplace Automation & ONDC Architecture"
      description="Real-time Mandi price indexing, ONDC Beckn Protocol connectivity, and automated FPO supplier feeds."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-left pt-1">
        {/* Top Status Banner */}
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-soft-sm">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Decentralized Network Status</h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Protocol: <span className="font-semibold text-slate-700">Beckn v1.2.0 (ONDC AGR10)</span>
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            loading={isLoadingStatus}
            onClick={loadStatus}
            className="text-xs rounded-xl"
          >
            Refresh
          </Button>
        </div>

        {/* 1. Dynamic APMC Mandi Price Pegging */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Agmarknet / e-NAM Live Price Discovery
              </h5>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Auto-Index Active
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Harvested agricultural crops dynamically peg their baseline prices to Pan-India APMC Mandi wholesale rates. When wholesale arrivals fluctuate in Lasalgaon, Kolar, Shimoga, or Khanna, product prices automatically synchronize to ensure market fairness without manual re-pricing.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              Tracked commodities: <span className="font-semibold text-slate-800">Arecanut, Onions, Tomatoes, Mangoes, Basmati, Wheat, Chilli</span>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={TrendingUp}
              loading={isSyncing}
              onClick={handleTriggerMandiSync}
              className="text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-soft-xs"
            >
              Sync Mandi Rates Now
            </Button>
          </div>

          {/* Sync Result Toast Box */}
          {syncFeedback && (
            <div className={`p-3 rounded-xl text-xs border ${syncFeedback.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'}`}>
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {syncFeedback.message}
              </div>
              {syncFeedback.result?.details?.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
                  {syncFeedback.result.details.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-white/80 p-1.5 rounded-lg border border-emerald-200/60">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">{d.productName}</span>
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="line-through text-slate-400">₹{d.previousPrice}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-700">₹{d.newPrice}/{d.unit}</span>
                        <span className="text-[9px] text-slate-400">({d.referenceMandi})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. ONDC Beckn Network Participants */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Connected ONDC Nodes (BAP & BPP)
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">IFFCO Kisan e-Bazar</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Automated Bio-fertilizers & Nano Urea catalog feed</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">KSSC Seeds Corporation</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Foundation certified high-yield seeds registry</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">MahaFPO Producer Network</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Farmer wholesale syndication & forward contracts</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs font-bold text-slate-800">Jain Irrigation & Agtech</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Drip irrigation kits & PM-KUSUM solar pumps</p>
            </div>
          </div>
        </div>

        {/* 3. Automated Feed Ingestion */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Automated FPO / Supplier Ingestion Webhook</span>
              <p className="text-[11px] text-slate-500">Supports standard Beckn JSON feeds & ERP catalog CSVs</p>
            </div>
          </div>
          <code className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 font-mono text-brand-700">
            POST /api/v1/marketplace/ingest-feed
          </code>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="md" onClick={onClose} className="rounded-xl font-bold">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
