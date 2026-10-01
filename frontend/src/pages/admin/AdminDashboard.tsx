import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  MousePointerClick,
  Users,
  Percent,
  Plus,
  ExternalLink,
  QrCode,
  Palette,
  Link2,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const activeSlug = user?.businesses?.[0]?.slug || 'onebite-bakery';
  const businessName = user?.businesses?.[0]?.name || 'OneBite Bakery';

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.getAnalytics(undefined, '30');
        if (isMounted) setStats(res.stats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalViews = stats?.totalViews ?? 0;
  const totalClicks = stats?.totalClicks ?? 0;
  const uniqueVisitors = stats?.uniqueVisitors ?? 0;
  const ctr = stats?.ctr || '0.0%';
  const topLinks = stats?.topLinks || [];
  const trends = stats?.trends || { viewsTrend: '+0%', clicksTrend: '+0%', uniqueTrend: '+0%' };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back to {businessName}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-lg">
            Manage your public business profile, customize links, monitor real-time visitor analytics, and generate QR marketing materials.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/admin/links"
            className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </Link>
          <Link
            to={`/${activeSlug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Live Site</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Views */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Page Views</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {trends.viewsTrend}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Last 30 days traffic</p>
        </div>

        {/* Metric 2: Total Link Clicks */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Link Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {trends.clicksTrend}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Actions taken by visitors</p>
        </div>

        {/* Metric 3: Unique Visitors */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Unique Visitors</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {uniqueVisitors.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {trends.uniqueTrend}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Distinct guest sessions</p>
        </div>

        {/* Metric 4: Click-through rate */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Click Through</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {ctr}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">Real-time intent</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Conversion efficiency</p>
        </div>
      </div>

      {/* Two Column Layout: Top Performing Links & Quick Hub Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Links Table */}
        <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Top Performing Links</h2>
              <p className="text-xs text-slate-400 mt-0.5">Most engaged links by your customers</p>
            </div>
            <Link
              to="/admin/links"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {topLinks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No link clicks recorded yet.</p>
            ) : (
              topLinks.map((link: any, idx: number) => {
                const maxClicks = Math.max(...topLinks.map((l: any) => l.clickCount || 0), 1);
                const pct = maxClicks > 0 && (link.clickCount || 0) > 0
                  ? Math.round(((link.clickCount || 0) / maxClicks) * 100)
                  : 0;

                return (
                  <div key={idx} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{link.title}</span>
                      </div>
                      <span className="font-mono text-orange-400 font-bold">
                        {link.clickCount || 0} {link.clickCount === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Shortcuts */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight mb-1">Quick Actions</h2>
            <p className="text-xs text-slate-400 mb-5">Frequently accessed management tools</p>

            <div className="space-y-2.5">
              <Link
                to="/admin/links"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">Links Studio</p>
                    <p className="text-[10px] text-slate-500">Add, edit, reorder & duplicate</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/appearance"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">Theme & Styling</p>
                    <p className="text-[10px] text-slate-500">Colors, buttons & preview</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/hours"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">Business Hours</p>
                    <p className="text-[10px] text-slate-500">Live open/closed schedule</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/qr"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">QR Code Studio</p>
                    <p className="text-[10px] text-slate-500">Download PNG & Vector SVG</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Quick access passcode: <strong className="text-orange-400 font-mono">753753</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
