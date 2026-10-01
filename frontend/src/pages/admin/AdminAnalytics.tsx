import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Users,
  Smartphone,
  Laptop,
  Tablet,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminAnalytics: React.FC = () => {
  const [days, setDays] = useState('30');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalytics(undefined, days);
        if (isMounted) setStats(res.stats);
      } catch (err: any) {
        error(err.message || 'Failed to load analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [days]);

  const totalViews = stats?.totalViews ?? 0;
  const totalClicks = stats?.totalClicks ?? 0;
  const uniqueVisitors = stats?.uniqueVisitors ?? 0;
  const ctr = stats?.ctr || '0.0%';
  const deviceMap = stats?.deviceMap || { mobile: 0, desktop: 0, tablet: 0 };
  const topLinks = stats?.topLinks || [];
  const trends = stats?.trends || { viewsTrend: '+0%', clicksTrend: '+0%', uniqueTrend: '+0%' };

  const totalDeviceSum = (deviceMap.mobile || 0) + (deviceMap.desktop || 0) + (deviceMap.tablet || 0);
  const mobilePct = totalDeviceSum > 0 ? Math.round(((deviceMap.mobile || 0) / totalDeviceSum) * 100) : 0;
  const desktopPct = totalDeviceSum > 0 ? Math.round(((deviceMap.desktop || 0) / totalDeviceSum) * 100) : 0;
  const tabletPct = totalDeviceSum > 0 ? Math.max(0, 100 - mobilePct - desktopPct) : 0;

  return (
    <div className="space-y-8 max-w-5xl pb-16 font-sans">
      {/* Top Bar with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-400" />
            <span>Visitor & Link Analytics</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time traffic metrics and customer engagement distribution
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {['7', '30', '90'].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                days === d
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {d === '7' ? '7 Days' : d === '30' ? '30 Days' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {totalViews.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> {trends.viewsTrend} vs prior
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {totalClicks.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> {trends.clicksTrend} vs prior
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Unique Visitors</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {uniqueVisitors.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> {trends.uniqueTrend} vs prior
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Click Through</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{ctr}</p>
          <span className="text-[11px] font-semibold text-emerald-400 block mt-1">
            Real-time intent
          </span>
        </div>
      </div>

      {/* Two Columns: Link Breakdown & Device Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Link Clicks Table */}
        <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6">
          <h2 className="text-sm font-bold text-white mb-1">Click Performance by Link</h2>
          <p className="text-xs text-slate-400 mb-6">Which destinations generate the most interest</p>

          <div className="space-y-4">
            {topLinks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No link clicks recorded yet.</p>
            ) : (
              topLinks.map((link: any, idx: number) => {
                const maxClicks = Math.max(...topLinks.map((l: any) => l.clickCount || 0), 1);
                const percentage = maxClicks > 0 && (link.clickCount || 0) > 0
                  ? Math.round(((link.clickCount || 0) / maxClicks) * 100)
                  : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{link.title}</span>
                      <span className="font-mono text-orange-400 font-bold">
                        {link.clickCount || 0} {link.clickCount === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Device Breakdown</h2>
            <p className="text-xs text-slate-400 mb-6">Traffic by device category</p>

            <div className="space-y-4">
              {/* Mobile */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Mobile</p>
                    <p className="text-[10px] text-slate-400">{deviceMap.mobile || 0} visits</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-orange-400 font-mono">{mobilePct}%</span>
              </div>

              {/* Desktop */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Desktop</p>
                    <p className="text-[10px] text-slate-400">{deviceMap.desktop || 0} visits</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-blue-400 font-mono">{desktopPct}%</span>
              </div>

              {/* Tablet */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Tablet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Tablet</p>
                    <p className="text-[10px] text-slate-400">{deviceMap.tablet || 0} visits</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-purple-400 font-mono">{tabletPct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Mobile-first design ensures optimal scan-to-action conversion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
