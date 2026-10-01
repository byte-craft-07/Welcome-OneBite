import React, { useEffect, useState } from 'react';
import { QrCode, Download, Copy, Check, ExternalLink, Printer, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminQR: React.FC = () => {
  const { user } = useAuth();
  const [slug, setSlug] = useState('onebite-bakery');
  const [businessName, setBusinessName] = useState('OneBite Bakery');
  const [qrData, setQrData] = useState<{ publicUrl: string; qrDataUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const { success } = useToast();

  useEffect(() => {
    let isMounted = true;
    const loadQR = async () => {
      setLoading(true);
      try {
        const business = user?.businesses?.[0];
        const currentSlug = business?.slug || 'onebite-bakery';
        setSlug(currentSlug);
        setBusinessName(business?.name || 'OneBite Bakery');

        const res = await api.getBusinessQR(currentSlug, qrColor, qrBgColor);
        if (isMounted) setQrData(res);
      } catch (err) {
        console.error('Failed to load QR:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadQR();
    return () => {
      isMounted = false;
    };
  }, [qrColor, qrBgColor, user]);

  const handleCopy = async () => {
    if (!qrData?.publicUrl) return;
    await navigator.clipboard.writeText(qrData.publicUrl);
    setCopied(true);
    success('Public URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    if (!qrData?.qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${slug}-qr-code.png`;
    link.href = qrData.qrDataUrl;
    link.click();
    success('PNG QR code downloaded');
  };

  const downloadSVG = () => {
    const svgUrl = `/api/public/business/${slug}/qr?format=svg&color=${encodeURIComponent(
      qrColor
    )}&bgcolor=${encodeURIComponent(qrBgColor)}`;
    const link = document.createElement('a');
    link.download = `${slug}-qr-code.svg`;
    link.href = svgUrl;
    link.click();
    success('Vector SVG downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-400" />
            <span>QR Code Marketing Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate and export print-ready QR codes for packaging, table tents, and flyers
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          <span>Print Table Stand</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: QR Display & Downloads */}
        <div className="md:col-span-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center text-center">
          {/* Public URL Box */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 mb-6">
            <span className="text-xs font-mono text-orange-400 truncate text-left">
              {qrData?.publicUrl || `http://localhost:5173/${slug}`}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-200 mb-6 relative group">
            {loading || !qrData?.qrDataUrl ? (
              <div className="w-60 h-60 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img
                src={qrData.qrDataUrl}
                alt="QR Code"
                className="w-60 h-60 object-contain rounded-xl"
              />
            )}
          </div>

          <h3 className="font-bold text-white text-base mb-1">{businessName}</h3>
          <p className="text-xs text-slate-400 mb-6">Scan with any mobile camera to view profile</p>

          {/* Download Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={downloadPNG}
              className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={downloadSVG}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Vector SVG</span>
            </button>
          </div>
        </div>

        {/* Right: Print Flyer Tent Card Preview */}
        <div className="md:col-span-6 bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Printable Table Tent / Counter Display</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Place this display on your billing counter, dining tables, or shop window
            </p>

            {/* Print Card Mockup */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 text-center max-w-xs mx-auto">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                OB
              </div>
              <h4 className="font-extrabold text-base tracking-tight">{businessName}</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                Scan for Menu & Links
              </p>

              <div className="my-4 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                {qrData?.qrDataUrl && (
                  <img src={qrData.qrDataUrl} alt="QR" className="w-36 h-36 mx-auto object-contain" />
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-600 font-medium">
                /{slug}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              High resolution error-correction level 'H' ensures fast scans in low light.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
