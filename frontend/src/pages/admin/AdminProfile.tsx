import React, { useEffect, useState } from 'react';
import {
  Save,
  Upload,
  ExternalLink,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Sparkles,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';
import { api, getFullImageUrl } from '../../services/api';
import { BusinessProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await api.getAdminBusiness();
        if (isMounted) setProfile(res.business);
      } catch (err: any) {
        error(err.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (subField: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        [subField]: value,
      },
    }));
  };

  const handleAboutChange = (subField: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      aboutSection: {
        enabled: prev.aboutSection?.enabled ?? true,
        title: prev.aboutSection?.title || 'About Us',
        description: prev.aboutSection?.description || '',
        imageUrl: prev.aboutSection?.imageUrl || '',
        [subField]: value,
      },
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverImageUrl' | 'aboutImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'logoUrl') setUploadingLogo(true);
    if (field === 'coverImageUrl') setUploadingCover(true);
    if (field === 'aboutImageUrl') setUploadingAboutImage(true);

    try {
      const res = await api.uploadImage(file);
      if (field === 'aboutImageUrl') {
        handleAboutChange('imageUrl', res.url);
      } else {
        handleChange(field, res.url);
      }
      success('Image uploaded successfully!');
    } catch (err: any) {
      error(err.message || 'Image upload failed');
    } finally {
      if (field === 'logoUrl') setUploadingLogo(false);
      if (field === 'coverImageUrl') setUploadingCover(false);
      if (field === 'aboutImageUrl') setUploadingAboutImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Ensure slug is clean lowercase
      const cleanSlug = (profile.slug || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

      // Sanitize phone & whatsapp
      let cleanPhone = (profile.phone || '').trim();
      if (/^91\+/i.test(cleanPhone)) {
        cleanPhone = '+91 ' + cleanPhone.replace(/^91\+\s*/i, '');
      }

      let cleanWhatsApp = (profile.whatsapp || '').trim();
      if (/^91\+/i.test(cleanWhatsApp)) {
        cleanWhatsApp = '+91 ' + cleanWhatsApp.replace(/^91\+\s*/i, '');
      }

      const payload = {
        ...profile,
        slug: cleanSlug,
        phone: cleanPhone,
        whatsapp: cleanWhatsApp,
      };
      const res = await api.updateBusiness(payload);
      setProfile(res.business);
      success('Business profile updated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
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
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16 font-sans">
      {/* Header and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 md:top-20 z-20 bg-slate-900/90 backdrop-blur-md py-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-400" />
            <span>Business Profile & Branding</span>
          </h1>
          <p className="text-xs text-slate-400">Configure public business identity and direct contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </a>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Primary Identity Section */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>General Business Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Name *</label>
            <input
              type="text"
              required
              value={profile.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. OneBite Bakery"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Public URL Slug *</label>
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 overflow-hidden focus-within:border-orange-500">
              <span className="px-3 text-xs text-slate-500 select-none bg-slate-800/50 py-2.5">/</span>
              <input
                type="text"
                required
                value={profile.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="onebite-bakery"
                className="w-full px-2 py-2.5 bg-transparent text-white text-xs focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagline / Slogan</label>
            <input
              type="text"
              value={profile.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="e.g. Freshly made for your moments"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Category</label>
            <input
              type="text"
              value={profile.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g. Bakery & Cafe, Restaurant, Freelancer, Salon"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Short Header Description</label>
          <input
            type="text"
            value={profile.shortDescription || ''}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            placeholder="A single catchy line summarizing what you offer"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isVerified ?? true}
              onChange={(e) => handleChange('isVerified', e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
            />
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Show Verified Badge</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isPublished ?? true}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
            />
            <span className="text-xs font-medium text-slate-300">Published (Visible Publicly)</span>
          </label>
        </div>
      </div>

      {/* Media & Images Section */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Logo & Cover Images</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Business Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {profile.logoUrl ? (
                  <img src={getFullImageUrl(profile.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                  />
                </label>
                <input
                  type="text"
                  value={profile.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="Or paste image URL"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cover Banner Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Cover Banner Image</label>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {profile.coverImageUrl ? (
                  <img src={getFullImageUrl(profile.coverImageUrl)} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-600">No banner</span>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                  />
                </label>
                <input
                  type="text"
                  value={profile.coverImageUrl || ''}
                  onChange={(e) => handleChange('coverImageUrl', e.target.value)}
                  placeholder="Or paste cover URL"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Contact & Social Channels */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>Contact Channels</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Direct Phone Call Number</span>
            </label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Number</span>
            </label>
            <input
              type="text"
              value={profile.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Default WhatsApp Greeting Message (Auto-Filled in Customer's Chat)
          </label>
          <input
            type="text"
            value={profile.whatsappDefaultMessage || ''}
            onChange={(e) => handleChange('whatsappDefaultMessage', e.target.value)}
            placeholder="Hello! I found your profile online and would like to order."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Official Email Address</span>
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="orders@business.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Main Website URL</span>
            </label>
            <input
              type="url"
              value={profile.websiteUrl || ''}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Physical Location & Map */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Location & Google Maps</span>
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Display Address</label>
          <input
            type="text"
            value={profile.address?.fullAddress || ''}
            onChange={(e) => handleAddressChange('fullAddress', e.target.value)}
            placeholder="14 Bakers Lane, Near Heritage Square, Bandra West, Mumbai 400050"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Google Maps URL</label>
          <input
            type="url"
            value={profile.mapUrl || ''}
            onChange={(e) => handleChange('mapUrl', e.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">City</label>
            <input
              type="text"
              value={profile.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">State</label>
            <input
              type="text"
              value={profile.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Country</label>
            <input
              type="text"
              value={profile.address?.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Pincode</label>
            <input
              type="text"
              value={profile.address?.pincode || ''}
              onChange={(e) => handleAddressChange('pincode', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400">
          Social Media Profiles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram URL</label>
            <input
              type="url"
              value={profile.instagramUrl || ''}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Facebook URL</label>
            <input
              type="url"
              value={profile.facebookUrl || ''}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">YouTube Channel URL</label>
            <input
              type="url"
              value={profile.youtubeUrl || ''}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Twitter / X URL</label>
            <input
              type="url"
              value={profile.twitterUrl || ''}
              onChange={(e) => handleChange('twitterUrl', e.target.value)}
              placeholder="https://x.com/yourhandle"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* About Us Card Section */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>About Us Section</span>
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.aboutSection?.enabled ?? true}
              onChange={(e) => handleAboutChange('enabled', e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
            />
            <span className="text-xs font-medium text-slate-300">Enable on Public Page</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Section Title</label>
          <input
            type="text"
            value={profile.aboutSection?.title || 'About Us'}
            onChange={(e) => handleAboutChange('title', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Story / About Description</label>
          <textarea
            rows={4}
            value={profile.aboutSection?.description || ''}
            onChange={(e) => handleAboutChange('description', e.target.value)}
            placeholder="Share your business craft, history, and values with your customers..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">About Section Image (Optional)</label>
          <div className="flex items-center gap-4">
            <div className="w-28 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {profile.aboutSection?.imageUrl ? (
                <img src={profile.aboutSection.imageUrl} alt="About" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-slate-600">No image</span>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingAboutImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'aboutImageUrl')}
                  />
                </label>
                {profile.aboutSection?.imageUrl && (
                  <button
                    type="button"
                    onClick={() => handleAboutChange('imageUrl', '')}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-medium border border-rose-800/60 transition-colors cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <input
                type="text"
                value={profile.aboutSection?.imageUrl || ''}
                onChange={(e) => handleAboutChange('imageUrl', e.target.value)}
                placeholder="Or paste image URL"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
