import React, { useEffect, useState } from 'react';
import {
  Palette,
  Save,
  Check,
  Eye,
  Sparkles,
  Smartphone,
  Layers,
  Layout,
  Type,
  Grid,
} from 'lucide-react';
import { api } from '../../services/api';
import { BusinessAppearance, ThemePreset } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminAppearance: React.FC = () => {
  const [appearance, setAppearance] = useState<BusinessAppearance>({
    theme: 'bakery',
    primaryColor: '#5c3826',
    secondaryColor: '#3e2415',
    backgroundColor: '#fffbeb',
    cardBackgroundColor: '#ffffff',
    textColor: '#1c1917',
    cardStyle: 'rounded-glass',
    buttonStyle: 'pill',
    borderRadius: 'xl',
    fontFamily: 'sans',
    profileLayout: 'banner-avatar',
    backgroundPattern: 'mesh',
    showVerifiedBadge: true,
    showShareButton: true,
    showQrButton: true,
    showHoursCard: true,
    showAboutCard: true,
    showContactCard: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchAppearance = async () => {
      try {
        const res = await api.getAppearance();
        if (isMounted && res.appearance) {
          setAppearance(res.appearance);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load appearance');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAppearance();
    return () => {
      isMounted = false;
    };
  }, []);

  const themePresets: Array<{
    id: ThemePreset;
    name: string;
    primary: string;
    secondary: string;
    bg: string;
    text: string;
    desc: string;
  }> = [
    {
      id: 'bakery',
      name: 'Artisan Chocolate & Bakery',
      primary: '#5c3826',
      secondary: '#3e2415',
      bg: '#fffbeb',
      text: '#1c1917',
      desc: 'Rich artisan chocolate & warm cream',
    },
    {
      id: 'classic',
      name: 'Classic Indigo',
      primary: '#4f46e5',
      secondary: '#3730a3',
      bg: '#f8fafc',
      text: '#0f172a',
      desc: 'Polished corporate corporate navy',
    },
    {
      id: 'minimal',
      name: 'Clean Minimal',
      primary: '#18181b',
      secondary: '#3f3f46',
      bg: '#ffffff',
      text: '#09090b',
      desc: 'High contrast monochrome sophistication',
    },
    {
      id: 'dark',
      name: 'Midnight Dark',
      primary: '#38bdf8',
      secondary: '#0284c7',
      bg: '#090d16',
      text: '#f1f5f9',
      desc: 'Deep OLED black with luminous cyan',
    },
    {
      id: 'elegant',
      name: 'Emerald Luxe',
      primary: '#059669',
      secondary: '#065f46',
      bg: '#f0fdf4',
      text: '#064e3b',
      desc: 'Botanical natural luxury aesthetic',
    },
    {
      id: 'modern',
      name: 'Rose Modern',
      primary: '#e11d48',
      secondary: '#9f1239',
      bg: '#fff1f2',
      text: '#881337',
      desc: 'Vibrant modern boutique atmosphere',
    },
    {
      id: 'soft',
      name: 'Lavender Soft',
      primary: '#7c3aed',
      secondary: '#5b21b6',
      bg: '#faf5ff',
      text: '#3b0764',
      desc: 'Gentle pastel lavender serenity',
    },
    {
      id: 'neon',
      name: 'Cyberpunk Neon',
      primary: '#06b6d4',
      secondary: '#ec4899',
      bg: '#050505',
      text: '#f8fafc',
      desc: 'Electrifying high-tech glow',
    },
  ];

  const applyPreset = (preset: typeof themePresets[0]) => {
    setAppearance({
      ...appearance,
      theme: preset.id,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.bg,
      textColor: preset.text,
      cardBackgroundColor: preset.id === 'dark' || preset.id === 'neon' ? '#111827' : '#ffffff',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAppearance(appearance);
      success('Appearance settings saved successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to save appearance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-6xl pb-16 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-400" />
            <span>Theme & Visual Appearance</span>
          </h1>
          <p className="text-xs text-slate-400">
            Customize color palette, card geometry, typography and preview on simulated mobile device
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Appearance</span>
        </button>
      </div>

      {/* Main Grid: Controls on Left, Live Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Controls) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Theme Presets */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Theme Presets</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Select an expertly crafted design preset or customize colors below
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themePresets.map((preset) => {
                const isSelected = appearance.theme === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-slate-900 shadow-md ring-2 ring-orange-500/30'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.bg, border: '1px solid #475569' }} />
                    </div>
                    <span className="text-xs font-bold text-slate-200 block truncate">{preset.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Palette */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-400" />
              <span>Custom Color Palette</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Accent</label>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <input
                    type="color"
                    value={appearance.primaryColor}
                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.primaryColor}
                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                    className="bg-transparent text-white font-mono text-xs w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Page Background</label>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <input
                    type="color"
                    value={appearance.backgroundColor}
                    onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.backgroundColor}
                    onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                    className="bg-transparent text-white font-mono text-xs w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Text Color</label>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <input
                    type="color"
                    value={appearance.textColor}
                    onChange={(e) => setAppearance({ ...appearance, textColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.textColor}
                    onChange={(e) => setAppearance({ ...appearance, textColor: e.target.value })}
                    className="bg-transparent text-white font-mono text-xs w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Button & Typography Styles */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-orange-400" />
              <span>Button Geometry & Typography</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Button Shape</label>
                <select
                  value={appearance.buttonStyle}
                  onChange={(e) => setAppearance({ ...appearance, buttonStyle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="pill">Pill (Rounded Full)</option>
                  <option value="rounded-2xl">Modern Soft (Rounded 2XL)</option>
                  <option value="rounded-lg">Subtle (Rounded LG)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Font Style</label>
                <select
                  value={appearance.fontFamily}
                  onChange={(e) =>
                    setAppearance({ ...appearance, fontFamily: e.target.value as any })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="sans">Modern Sans-Serif (Inter)</option>
                  <option value="serif">Artisanal Serif (Playfair)</option>
                  <option value="mono">Tech Monospace (Fira Code)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Background Pattern</label>
                <select
                  value={appearance.backgroundPattern}
                  onChange={(e) =>
                    setAppearance({ ...appearance, backgroundPattern: e.target.value as any })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="mesh">Soft Mesh Ambient</option>
                  <option value="dots">Subtle Dot Matrix</option>
                  <option value="grid">Clean Architectural Grid</option>
                  <option value="none">Flat Solid Color</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-white mb-2">Display Elements</h2>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearance.showShareButton}
                  onChange={(e) => setAppearance({ ...appearance, showShareButton: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-300">Share Button</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearance.showQrButton}
                  onChange={(e) => setAppearance({ ...appearance, showQrButton: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-300">QR Code Button</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearance.showHoursCard}
                  onChange={(e) => setAppearance({ ...appearance, showHoursCard: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-300">Business Hours Pill</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appearance.showContactCard}
                  onChange={(e) => setAppearance({ ...appearance, showContactCard: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-300">Quick Contact Bar</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview Frame */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>Real-Time Mobile Preview</span>
            </div>

            {/* Mobile Device Frame */}
            <div className="w-[320px] h-[640px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30" />

              {/* Screen Content */}
              <div
                className="w-full h-full rounded-[38px] overflow-y-auto flex flex-col items-center p-4 pt-6 text-center select-none"
                style={{
                  backgroundColor: appearance.backgroundColor,
                  color: appearance.textColor,
                  fontFamily: appearance.fontFamily,
                }}
              >
                {/* Logo */}
                <div
                  className="w-16 h-16 rounded-full shadow-md flex items-center justify-center font-bold text-lg text-white mb-2 overflow-hidden ring-2 ring-white/50"
                  style={{ backgroundColor: appearance.primaryColor }}
                >
                  OB
                </div>

                <h3 className="font-extrabold text-base leading-tight">OneBite Bakery</h3>
                <p className="text-[11px] opacity-75 italic mt-0.5">Freshly made for your moments</p>

                {appearance.showHoursCard && (
                  <div className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Open Now • Closes at 10 PM</span>
                  </div>
                )}

                {/* Sample Buttons */}
                <div className="w-full space-y-2 mt-4">
                  <div
                    className={`w-full p-2.5 shadow-sm text-xs font-bold text-white flex items-center justify-between ${
                      appearance.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-xl'
                    }`}
                    style={{ backgroundColor: appearance.primaryColor }}
                  >
                    <span>🛒 Order From Website</span>
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Featured</span>
                  </div>

                  <div
                    className={`w-full p-2.5 shadow-sm text-xs font-semibold flex items-center justify-between border ${
                      appearance.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-xl'
                    }`}
                    style={{
                      backgroundColor: appearance.cardBackgroundColor || '#ffffff',
                      borderColor: '#e2e8f0',
                      color: appearance.textColor,
                    }}
                  >
                    <span>💬 WhatsApp Us</span>
                    <span>→</span>
                  </div>

                  <div
                    className={`w-full p-2.5 shadow-sm text-xs font-semibold flex items-center justify-between border ${
                      appearance.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-xl'
                    }`}
                    style={{
                      backgroundColor: appearance.cardBackgroundColor || '#ffffff',
                      borderColor: '#e2e8f0',
                      color: appearance.textColor,
                    }}
                  >
                    <span>📍 Find Us on Map</span>
                    <span>→</span>
                  </div>
                </div>

                <div className="mt-6 text-[9px] opacity-50">OneBite Bakery • LinkHub</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
