import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  X,
  PartyPopper,
  Gift,
  Cake,
  Heart,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface GrandOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  phone?: string;
  whatsapp?: string;
  mapUrl?: string;
  address?: string;
}

export const GrandOpeningModal: React.FC<GrandOpeningModalProps> = ({
  isOpen,
  onClose,
  businessName = 'OneBite Bakery',
  phone = '+91 7524086674',
  whatsapp = '+91 7524086674',
  mapUrl = 'https://maps.google.com/?q=OneBite+Bakery+terha',
  address = '14 Bakers Lane, Terha, Hamirpur (U.P.)',
}) => {
  // Target Grand Opening Date: 11 October 2026, 09:00:00 AM IST
  const targetDate = new Date('2026-10-11T09:00:00+05:30').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isOpen) return null;

  // Format WhatsApp message
  const whatsappDigits = (whatsapp || phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = whatsappDigits.length === 10 ? `91${whatsappDigits}` : whatsappDigits;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'नमस्ते! OneBite Bakery के भव्य उद्घाटन (11/10/2026 - नवरात्रि का पहला दिन) के लिए बहुत-बहुत बधाई व शुभकामनाएं! 🎉🎂'
  )}`;

  const callHref = `tel:${(phone || '').replace(/[^0-9+]/g, '')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-orange-50 rounded-3xl shadow-2xl border-2 border-amber-300/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Close Announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Festive Header Banner */}
        <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 text-white pt-6 pb-7 px-5 text-center overflow-hidden shadow-md">
          {/* Decorative Sparkle Accents */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-rose-400/30 rounded-full blur-xl pointer-events-none" />
          
          {/* Auspicious Greeting */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-yellow-200 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>🌸 ॐ श्री गणेशाय नमः • शुभ नवरात्रि 🌸</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          {/* Main Title Badge */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md uppercase">
              Grand Opening
            </h2>
            <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce scale-x-[-1]" />
          </div>

          <p className="text-sm sm:text-base font-extrabold text-amber-100 tracking-wide">
            {businessName} का भव्य शुभारंभ
          </p>

          <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
            माँ शैलपुत्री के पावन आशीर्वाद से • शारदीय नवरात्रि का प्रथम दिन
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* BIG HIGHLIGHTED DATE CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 shadow-lg border-2 border-amber-300 text-center">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-extrabold tracking-wider uppercase mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-yellow-200" />
              <span>शुभ उद्घाटन तिथि (Opening Date)</span>
            </div>

            {/* Bada Date Text */}
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-yellow-100 drop-shadow-sm my-1">
              11 / 10 / 2026
            </div>

            <div className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
              <span>11 अक्टूबर 2026</span>
              <span className="text-yellow-200">•</span>
              <span>रविवार (Sunday)</span>
            </div>

            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-black/25 text-yellow-200 text-xs sm:text-sm font-semibold border border-yellow-300/40">
              🚩 नवरात्रि का पहला दिन (Day 1 - Navratri)
            </div>
          </div>

          {/* COUNTDOWN TIMER */}
          <div className="bg-white rounded-2xl p-3.5 border border-amber-200 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-600 mb-2">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>
                {timeLeft.isPast ? '🎉 आज भव्य उद्घाटन का दिन है! 🎉' : 'भव्य उद्घाटन में शेष समय (Countdown):'}
              </span>
            </div>

            {!timeLeft.isPast ? (
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-center">
                  <div className="text-xl sm:text-2xl font-black text-amber-900 leading-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">दिन (Days)</div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-center">
                  <div className="text-xl sm:text-2xl font-black text-amber-900 leading-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">घंटे (Hours)</div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-center">
                  <div className="text-xl sm:text-2xl font-black text-amber-900 leading-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">मिनट (Mins)</div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-center">
                  <div className="text-xl sm:text-2xl font-black text-orange-600 leading-tight animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">सेकंड (Secs)</div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-emerald-700 font-extrabold text-sm sm:text-base animate-pulse">
                🌟 OneBite Bakery का भव्य उद्घाटन हो चुका है! आपका हार्दिक स्वागत है! 🌟
              </div>
            )}
          </div>

          {/* INVITATION & HIGHLIGHTS */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/60 rounded-2xl p-4 border border-orange-200/70 text-stone-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h4 className="text-sm font-bold text-stone-900">
                आप सभी परिवार सहित सादर आमंत्रित हैं!
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              स्वाद और खुशियों का नया ठिकाना अब आपके शहर <strong>तेरहा (हमीरपुर)</strong> में खुल रहा है। 
              नवरात्रि के पावन अवसर पर पधारकर हमें अपने स्नेह व आशीर्वाद से अनुग्रहित करें।
            </p>

            {/* Special Highlights Pills */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                <Cake className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="font-semibold text-stone-700 truncate">फ्रेश डिजाइनर केक</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold text-stone-700 truncate">स्पेशल ओपनिंग गिफ्ट</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-stone-700 truncate">हॉट पिज़्ज़ा व कॉम्बो</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                <Sparkles className="w-4 h-4 text-yellow-600 shrink-0" />
                <span className="font-semibold text-stone-700 truncate">पार्टी डेकोरेशन</span>
              </div>
            </div>
          </div>

          {/* LOCATION & ADDRESS */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-700">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-stone-900 block">स्थान / Outlet Location:</span>
              <span>{address}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp Action */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर विश करें</span>
              </a>

              {/* Location Directions Action */}
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <MapPin className="w-4 h-4" />
                <span>लोकेशन देखें (Maps)</span>
              </a>
            </div>

            {/* Direct Call Button if needed */}
            {phone && (
              <a
                href={callHref}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>कॉल करें: {phone}</span>
              </a>
            )}

            {/* Close / Explore Website CTA */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95"
            >
              <span>पेज और मेन्यू देखें (Explore Store)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-stone-100 py-2.5 px-4 text-center border-t border-stone-200">
          <p className="text-[11px] font-semibold text-stone-500">
            OneBite Bakery • 11/10/2026 • आप सभी का हार्दिक स्वागत है! ❤️
          </p>
        </div>
      </div>
    </div>
  );
};
