"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, RefreshCcw, TrendingUp } from "lucide-react";
import { fetchMerchantDashboard, type MerchantDashboardResponse } from "@/api/aiApi";

export function MerchantDashboardPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MerchantDashboardResponse | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await fetchMerchantDashboard(30);
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load merchant dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-700 bg-black-primary p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-100">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide">Merchant AI Dashboard</h3>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-zinc-100"
        >
          <RefreshCcw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-zinc-300 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Building AI insights...
        </div>
      )}

      {error && <p className="text-xs text-red-300">{error}</p>}

      {data && !loading && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-700 bg-black-secondary p-2">
              <p className="text-zinc-400">Total swaps</p>
              <p className="text-zinc-100 text-sm font-semibold">{data.kpis.totalSwaps}</p>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-black-secondary p-2">
              <p className="text-zinc-400">Avg daily</p>
              <p className="text-zinc-100 text-sm font-semibold">{data.kpis.avgDailySwaps}</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-black-secondary p-2">
            <div className="flex items-center gap-2 text-zinc-200 mb-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>Forecast</span>
            </div>
            <p className="text-zinc-100">Projected swaps (next 7 days): {data.kpis.projectedNext7Days}</p>
            <p className="text-zinc-400 mt-1">{data.insight}</p>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-black-secondary p-2">
            <p className="text-zinc-300 mb-1">Top pairs</p>
            <div className="space-y-1">
              {data.topPairs.length === 0 && <p className="text-zinc-500">No pair data yet</p>}
              {data.topPairs.map((pair) => (
                <p key={pair.pair} className="text-zinc-400">
                  {pair.pair} <span className="text-zinc-200">({pair.count})</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
