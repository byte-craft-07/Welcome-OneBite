import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Share2,
  QrCode,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Calendar,
  X,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { api, getFullImageUrl } from '../services/api';
import { PublicBusinessData, BusinessLink } from '../types';
import { IconRenderer } from '../components/IconRenderer';
import { AdminQuickAccessModal } from '../components/AdminQuickAccessModal';
import { useToast } from '../context/ToastContext';

// Helpers to safely format link hrefs with proper protocol and handling
const formatWhatsAppHref = (rawPhoneOrUrl?: string, defaultMsg?: string, fallbackPhone?: string): string => {
  const input = (rawPhoneOrUrl || '').trim();

  // If already a complete wa.me or api.whatsapp.com URL, return as-is
  if (
    input.startsWith('https://wa.me/') ||
    input.startsWith('http://wa.me/') ||
    input.startsWith('https://api.whatsapp.com/') ||
    input.startsWith('http://api.whatsapp.com/')
  ) {
    return input;
  }

  const rawPhone = input || fallbackPhone || '';
  if (!rawPhone) return '#';

  let digits = rawPhone.replace(/[^0-9]/g, '');
  if (!digits) return '#';

  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  const msg = defaultMsg ? encodeURIComponent(defaultMsg.trim()) : '';
  return msg ? `https://wa.me/${digits}?text=${msg}` : `https://wa.me/${digits}`;
};

const formatPhoneHref = (rawPhoneOrUrl?: string, fallbackPhone?: string): string => {
  let raw = (rawPhoneOrUrl || fallbackPhone || '').trim();
  if (!raw) return '#';

  // Strip leading tel: schemes if any
  raw = raw.replace(/^(tel:)+/i, '').trim();

  // Handle accidental '91+ 7524086674' format
  if (/^91\+/i.test(raw)) {
    raw = '+' + raw.replace(/^91\+/i, '91');
  }

  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '#';

  let formattedNumber = digits;
  if (digits.length === 10) {
    formattedNumber = `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    formattedNumber = `+${digits}`;
  } else if (raw.startsWith('+')) {
    formattedNumber = `+${digits}`;
  }

  return `tel:${formattedNumber}`;
};

const formatLinkHref = (rawUrl?: string, type?: string, business?: any): string => {
  const url = (rawUrl || '').trim();

  if (type === 'whatsapp') {
    return formatWhatsAppHref(url, business?.whatsappDefaultMessage, business?.whatsapp);
  }

  if (type === 'phone') {
    return formatPhoneHref(url, business?.phone);
  }

  if (type === 'email') {
    const email = (url || business?.email || '').trim();
    if (!email) return '#';
    return email.startsWith('mailto:') ? email : `mailto:${email}`;
  }

  if (type === 'map') {
    return url || business?.mapUrl || '#';
  }

  if (url.startsWith('#') || url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }

  if (!url) return '#';

  return `https://${url}`;
};

export const PublicBusinessPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const activeSlug = slug || 'onebite-bakery';

  const [data, setData] = useState<PublicBusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ publicUrl: string; qrDataUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { success, info } = useToast();

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setErrorState(null);
      try {
        const result = await api.getPublicBusiness(activeSlug);
        if (isMounted) {
          setData(result);
          // Track page view asynchronously
          api.trackPageView(activeSlug, document.referrer);
          // Set dynamic document title
          if (result.business.name) {
            document.title = result.business.seo?.title || `${result.business.name} | Official Business Profile`;
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorState(err.message || 'Unable to load business profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  const handleLinkClick = (link: BusinessLink, e: React.MouseEvent) => {
    // Fire click tracking asynchronously without blocking navigation
    if (data?.business.slug && (link.id || link._id)) {
      api.trackLinkClick(data.business.slug, link.id || (link._id as string), document.referrer);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = data?.business.name || 'Business Profile';
    const shareText = data?.business.tagline || 'Check out our official business profile and links';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        success('Shared successfully!');
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        success('✓ Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        info('Please copy the URL from your browser address bar.');
      }
    }
  };

  const handleOpenQrModal = async () => {
    setQrModalOpen(true);
    if (!qrCodeData && data?.business.slug) {
      try {
        const qr = await api.getBusinessQR(data.business.slug);
        setQrCodeData(qr);
      } catch (e) {
        // failed
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-stone-600">Loading business profile...</p>
        </div>
      </div>
    );
  }

  if (errorState || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-stone-200">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Profile Not Available</h2>
          <p className="text-sm text-stone-600 mb-6">{errorState || 'This business page could not be found.'}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-5 rounded-2xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20"
            >
              Retry
            </button>
            <button
              onClick={() => setAdminModalOpen(true)}
              className="py-2.5 px-4 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
        <AdminQuickAccessModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
      </div>
    );
  }

  const { business, links, hours, openStatus, appearance } = data;

  // Derive theme colors and styles
  const isDarkTheme = appearance.theme === 'dark';
  const primaryColor = appearance.primaryColor || '#f97316';
  const bgColor = appearance.backgroundColor || (isDarkTheme ? '#0f172a' : '#fffbeb');
  const textColor = appearance.textColor || (isDarkTheme ? '#f8fafc' : '#1c1917');
  const cardBg = appearance.cardBackgroundColor || (isDarkTheme ? '#1e293b' : '#ffffff');

  // Background pattern CSS
  let bgPatternClass = '';
  if (appearance.backgroundPattern === 'dots') {
    bgPatternClass = 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]';
  } else if (appearance.backgroundPattern === 'grid') {
    bgPatternClass = 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]';
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between font-${appearance.fontFamily || 'sans'} transition-colors duration-300 ${bgPatternClass}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Top Banner / Cover Image */}
      {business.coverImageUrl && (
        <div className="w-full h-36 md:h-52 relative overflow-hidden bg-stone-200">
          <img
            src={getFullImageUrl(business.coverImageUrl)}
            alt={`${business.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
      )}

      {/* Main Container - Centered Mobile-First Container */}
      <div className={`w-full max-w-md md:max-w-lg px-4 ${business.coverImageUrl ? '-mt-16 md:-mt-20' : 'pt-8'} pb-12 flex-1 flex flex-col items-center z-10`}>
        
        {/* Profile Card Header */}
        <div className="w-full flex flex-col items-center text-center mb-6">
          {/* Business Logo */}
          <div className="relative mb-3 group">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-white shadow-xl ring-4 ring-orange-500/20 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: cardBg }}
            >
              {business.logoUrl ? (
                <img
                  src={getFullImageUrl(business.logoUrl)}
                  alt={business.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center font-black text-2xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {business.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {business.isVerified && appearance.showVerifiedBadge && (
              <div
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md border-2 border-white"
                title="Verified Business"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Business Name */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-1.5 justify-center">
            <span>{business.name}</span>
          </h1>

          {/* Tagline */}
          {business.tagline && (
            <p className="text-sm md:text-base font-medium opacity-85 mt-1 italic max-w-xs">
              "{business.tagline}"
            </p>
          )}

          {/* Short Description */}
          {business.shortDescription && (
            <p className="text-xs md:text-sm opacity-70 mt-2 max-w-sm leading-relaxed">
              {business.shortDescription}
            </p>
          )}

          {/* Real-time Open / Closed Status Pill */}
          {openStatus && appearance.showHoursCard && (
            <button
              onClick={() => setHoursModalOpen(true)}
              className="mt-3.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
              style={{
                backgroundColor: openStatus.isOpen ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                borderColor: openStatus.isOpen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                color: openStatus.isOpen ? '#15803d' : '#b91c1c',
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  openStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{openStatus.statusText}</span>
              <span className="opacity-40">•</span>
              <span className="font-normal opacity-90">{openStatus.nextStatusMessage}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}

          {/* Action Toolbar: Share & QR */}
          <div className="flex items-center gap-2 mt-4">
            {appearance.showShareButton && (
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border border-black/10 hover:border-black/20 bg-white/80 dark:bg-stone-800/80 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share Profile'}</span>
              </button>
            )}

            {appearance.showQrButton && (
              <button
                onClick={handleOpenQrModal}
                className="px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border border-black/10 hover:border-black/20 bg-white/80 dark:bg-stone-800/80 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Contact Buttons Row */}
        {appearance.showContactCard && (
          <div className="w-full grid grid-cols-4 gap-2 mb-6">
            {business.phone && (
              <a
                href={formatPhoneHref(business.phone)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-stone-800/90 shadow-sm border border-stone-200/60 dark:border-stone-700/60 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Call</span>
              </a>
            )}

            {business.whatsapp && (
              <a
                href={business.directWhatsAppUrl || formatWhatsAppHref(business.whatsapp, business.whatsappDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-stone-800/90 shadow-sm border border-stone-200/60 dark:border-stone-700/60 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">WhatsApp</span>
              </a>
            )}

            {business.mapUrl && (
              <a
                href={business.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-stone-800/90 shadow-sm border border-stone-200/60 dark:border-stone-700/60 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Directions</span>
              </a>
            )}

            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-stone-800/90 shadow-sm border border-stone-200/60 dark:border-stone-700/60 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Email</span>
              </a>
            )}
          </div>
        )}

        {/* Links List Section */}
        <div className="w-full space-y-3.5 mb-8">
          {links && links.length > 0 ? (
            links.map((link) => {
              const isFeatured = link.isFeatured;
              const buttonRadius = appearance.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-2xl';

              const formattedHref = formatLinkHref(link.url, link.type, business);
              const isAnchor = formattedHref.startsWith('#');

              return (
                <a
                  key={link.id || link._id}
                  href={formattedHref}
                  target={isAnchor ? '_self' : (link.openInNewTab ? '_blank' : '_self')}
                  rel={!isAnchor && link.openInNewTab ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleLinkClick(link, e)}
                  className={`w-full group block relative overflow-hidden transition-all duration-300 active:scale-[0.98] ${buttonRadius} ${
                    isFeatured
                      ? 'shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 border-2'
                      : 'shadow-sm hover:shadow-md border'
                  }`}
                  style={{
                    backgroundColor: isFeatured
                      ? link.highlightColor || primaryColor
                      : cardBg,
                    borderColor: isFeatured
                      ? link.highlightColor || primaryColor
                      : isDarkTheme
                      ? '#334155'
                      : 'rgba(229, 231, 235, 0.9)',
                    color: isFeatured ? '#ffffff' : textColor,
                  }}
                >
                  <div className="p-4 flex items-center justify-between gap-3.5">
                    {/* Icon or Thumbnail */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {link.imageUrl ? (
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={getFullImageUrl(link.imageUrl)}
                            alt={link.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                            isFeatured
                              ? 'bg-white/20 text-white'
                              : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                          }`}
                        >
                          <IconRenderer name={link.icon || 'Globe'} className="w-5 h-5" />
                        </div>
                      )}

                      {/* Title & Description */}
                      <div className="truncate text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm md:text-base tracking-tight truncate block">
                            {link.title}
                          </span>
                          {link.customBadge && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                isFeatured
                                  ? 'bg-white text-orange-600'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                              }`}
                            >
                              {link.customBadge}
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              isFeatured ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Action Arrow */}
                    <div
                      className={`p-1.5 rounded-full shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
                        isFeatured ? 'text-white/80' : 'text-stone-400'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              );
            })
          ) : (
            <div className="w-full py-8 text-center bg-white/50 rounded-2xl border border-stone-200">
              <p className="text-xs text-stone-500">No active links configured yet.</p>
            </div>
          )}
        </div>

        {/* Optional About Section */}
        {business.aboutSection?.enabled && business.aboutSection.description && appearance.showAboutCard && (
          <div
            id="about"
            className="w-full bg-white dark:bg-stone-800/90 rounded-3xl p-5 mb-6 shadow-sm border border-stone-200/80 dark:border-stone-700/80"
          >
            <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>{business.aboutSection.title || 'About Us'}</span>
            </h3>
            <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {business.aboutSection.description}
            </p>
            {business.aboutSection.imageUrl && (
              <img
                src={getFullImageUrl(business.aboutSection.imageUrl)}
                alt="About"
                className="mt-3.5 w-full h-44 object-cover rounded-2xl shadow-sm"
              />
            )}
          </div>
        )}

        {/* Location & Address Card */}
        {business.address?.fullAddress && (
          <div className="w-full bg-white dark:bg-stone-800/90 rounded-3xl p-5 mb-6 shadow-sm border border-stone-200/80 dark:border-stone-700/80">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Our Location</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              {business.address.fullAddress}
            </p>
            {business.mapUrl && (
              <a
                href={business.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Social Media Links Bar */}
        {(business.instagramUrl || business.facebookUrl || business.youtubeUrl || business.twitterUrl || business.linkedinUrl) && (
          <div className="flex items-center justify-center gap-4 py-4 mb-6">
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-sm border border-stone-200/70 dark:border-stone-700/70 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-pink-600 hover:scale-110 transition-all"
                title="Instagram"
              >
                <IconRenderer name="Instagram" className="w-4 h-4" />
              </a>
            )}
            {business.facebookUrl && (
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-sm border border-stone-200/70 dark:border-stone-700/70 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-blue-600 hover:scale-110 transition-all"
                title="Facebook"
              >
                <IconRenderer name="Facebook" className="w-4 h-4" />
              </a>
            )}
            {business.youtubeUrl && (
              <a
                href={business.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-sm border border-stone-200/70 dark:border-stone-700/70 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-red-600 hover:scale-110 transition-all"
                title="YouTube"
              >
                <IconRenderer name="Youtube" className="w-4 h-4" />
              </a>
            )}
            {business.twitterUrl && (
              <a
                href={business.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-sm border border-stone-200/70 dark:border-stone-700/70 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-sky-500 hover:scale-110 transition-all"
                title="Twitter"
              >
                <IconRenderer name="Twitter" className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Footer with Business Link Hub & User-Requested Admin Access Button */}
        <footer className="w-full pt-4 pb-2 text-center flex flex-col items-center gap-3">
          <p className="text-[11px] font-medium text-stone-400">
            {business.name} • Powered by Business Link Hub
          </p>

          {/* ADMIN ACCESS BUTTON: Passcode modal */}
          <button
            onClick={() => setAdminModalOpen(true)}
            className="group px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-950 text-stone-300 hover:text-white border border-stone-700/50 shadow-md text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Business Owner Admin Panel"
          >
            <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Lock className="w-3 h-3" />
            </div>
            <span>Admin Access</span>
          </button>
        </footer>
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xs bg-white rounded-3xl p-6 text-center shadow-2xl border border-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-stone-900">Scan to Open Profile</h4>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrCodeData?.qrDataUrl ? (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 inline-block mb-4 shadow-inner">
                <img
                  src={qrCodeData.qrDataUrl}
                  alt={`${business.name} QR Code`}
                  className="w-52 h-52 object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-52 h-52 flex items-center justify-center mx-auto mb-4 bg-stone-50 rounded-2xl">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <p className="text-xs text-stone-500 mb-4 truncate font-mono">
              {window.location.origin}/{business.slug}
            </p>

            <button
              onClick={handleShare}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20 transition-all"
            >
              Share Link
            </button>
          </div>
        </div>
      )}

      {/* Weekly Hours Modal */}
      {hoursModalOpen && hours && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-100 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">Business Hours</h4>
              </div>
              <button
                onClick={() => setHoursModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs mb-4">
              {hours.days.map((d) => {
                const isCurrent = openStatus?.currentDay.toLowerCase() === d.day.toLowerCase();
                return (
                  <div
                    key={d.day}
                    className={`py-2.5 flex items-center justify-between ${
                      isCurrent ? 'font-bold text-orange-600 dark:text-orange-400' : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    <span className="capitalize">{d.day}</span>
                    <span>
                      {d.isOpen ? `${d.openTime} – ${d.closeTime}` : <span className="text-rose-500 font-medium">Closed</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            {hours.specialNotes && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 italic mb-4 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                "{hours.specialNotes}"
              </p>
            )}

            <button
              onClick={() => setHoursModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Admin Quick Access Modal (Passcode 753753) */}
      <AdminQuickAccessModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </div>
  );
};
