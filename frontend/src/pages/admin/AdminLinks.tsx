import React, { useEffect, useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Sparkles,
  Link2,
  ExternalLink,
  Star,
  Check,
  X,
  Upload,
} from 'lucide-react';
import { api } from '../../services/api';
import { BusinessLink, LinkType } from '../../types';
import { IconRenderer, availableIconNames } from '../../components/IconRenderer';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

export const AdminLinks: React.FC = () => {
  const [links, setLinks] = useState<BusinessLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<BusinessLink | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingLink, setSavingLink] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<BusinessLink>>({
    title: '',
    description: '',
    type: 'website',
    url: '',
    icon: 'Globe',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
    openInNewTab: true,
    customBadge: '',
  });

  const { success, error } = useToast();

  const fetchLinks = async () => {
    try {
      const res = await api.getAdminLinks();
      setLinks(res.links);
    } catch (err: any) {
      error(err.message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openAddModal = () => {
    setEditingLink(null);
    setFormData({
      title: '',
      description: '',
      type: 'website',
      url: '',
      icon: 'Globe',
      imageUrl: '',
      isActive: true,
      isFeatured: false,
      openInNewTab: true,
      customBadge: '',
      sortOrder: links.length,
    });
    setModalOpen(true);
  };

  const openEditModal = (link: BusinessLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      description: link.description || '',
      type: link.type,
      url: link.url || '',
      icon: link.icon || 'Globe',
      imageUrl: link.imageUrl || '',
      isActive: link.isActive,
      isFeatured: link.isFeatured,
      openInNewTab: link.openInNewTab,
      customBadge: link.customBadge || '',
      sortOrder: link.sortOrder,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (link: BusinessLink) => {
    const linkId = link.id || link._id;
    if (!linkId) return;

    try {
      const res = await api.toggleLinkActive(linkId);
      setLinks((prev) =>
        prev.map((l) => ((l.id || l._id) === linkId ? { ...l, isActive: res.link.isActive } : l))
      );
      success(res.message);
    } catch (err: any) {
      error(err.message || 'Failed to toggle status');
    }
  };

  const handleDuplicate = async (link: BusinessLink) => {
    const linkId = link.id || link._id;
    if (!linkId) return;

    try {
      const res = await api.duplicateLink(linkId);
      setLinks((prev) => [...prev, res.link]);
      success('Link duplicated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to duplicate link');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await api.deleteLink(deleteConfirmId);
      setLinks((prev) => prev.filter((l) => (l.id || l._id) !== deleteConfirmId));
      success('Link deleted successfully');
      setDeleteConfirmId(null);
    } catch (err: any) {
      error(err.message || 'Failed to delete link');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    // Update sortOrder values
    const updatedWithOrder = newLinks.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));

    setLinks(updatedWithOrder);

    // Save to server
    try {
      const itemsToSave = updatedWithOrder.map((item) => ({
        id: (item.id || item._id) as string,
        sortOrder: item.sortOrder,
      }));
      await api.reorderLinks(itemsToSave);
      success('Link order saved');
    } catch (err: any) {
      error(err.message || 'Failed to reorder links');
      fetchLinks(); // rollback
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      error('Link title is required');
      return;
    }

    let formattedUrl = (formData.url || '').trim();
    if (formData.type === 'phone') {
      formattedUrl = formattedUrl.replace(/^(tel:)+/i, '').trim();
      if (/^91\+/i.test(formattedUrl)) {
        formattedUrl = '+' + formattedUrl.replace(/^91\+/i, '91');
      }
      const digits = formattedUrl.replace(/[^0-9]/g, '');
      if (digits.length === 10) formattedUrl = `+91${digits}`;
      else if (digits.length === 12 && digits.startsWith('91')) formattedUrl = `+${digits}`;
      else if (formattedUrl.startsWith('+')) formattedUrl = `+${digits}`;
      else if (digits) formattedUrl = digits;
    } else if (formData.type === 'whatsapp') {
      if (
        !formattedUrl.startsWith('https://wa.me/') &&
        !formattedUrl.startsWith('http://wa.me/') &&
        !formattedUrl.startsWith('https://api.whatsapp.com/')
      ) {
        let digits = formattedUrl.replace(/[^0-9]/g, '');
        if (digits.length === 10) digits = `91${digits}`;
        formattedUrl = digits;
      }
    } else if (
      formattedUrl &&
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://') &&
      !formattedUrl.startsWith('mailto:') &&
      !formattedUrl.startsWith('tel:') &&
      !formattedUrl.startsWith('#')
    ) {
      if (formData.type === 'email') {
        formattedUrl = `mailto:${formattedUrl}`;
      } else {
        formattedUrl = `https://${formattedUrl}`;
      }
    }

    const payload = { ...formData, url: formattedUrl };

    setSavingLink(true);
    try {
      if (editingLink) {
        const linkId = (editingLink.id || editingLink._id) as string;
        const res = await api.updateLink(linkId, payload);
        setLinks((prev) =>
          prev.map((l) => ((l.id || l._id) === linkId ? res.link : l))
        );
        success('Link updated successfully!');
      } else {
        const res = await api.createLink(payload);
        setLinks((prev) => [...prev, res.link]);
        success('New link created successfully!');
      }
      setModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save link');
    } finally {
      setSavingLink(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Link2 className="w-6 h-6 text-orange-400" />
            <span>Links Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create, reorder, feature, and manage all clickable destinations
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Link</span>
        </button>
      </div>

      {/* Links List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Link2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No links added yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Add website links, WhatsApp chat triggers, Google Maps location, Instagram and custom services.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Link</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => {
            const linkId = (link.id || link._id) as string;
            return (
              <div
                key={linkId}
                className={`bg-slate-950/80 border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  link.isActive
                    ? link.isFeatured
                      ? 'border-orange-500/50 shadow-md shadow-orange-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/40 opacity-60 bg-slate-950/40'
                }`}
              >
                {/* Left info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === links.length - 1}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-orange-400">
                    <IconRenderer name={link.icon || 'Globe'} className="w-5 h-5" />
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate block">{link.title}</span>
                      {link.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Featured</span>
                        </span>
                      )}
                      {link.customBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 shrink-0">
                          {link.customBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {link.url || `(${link.type.toUpperCase()})`}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Click Count */}
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                    {link.clickCount || 0} clicks
                  </div>

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(link)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                      link.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                    title={link.isActive ? 'Active (Click to hide)' : 'Inactive (Click to show)'}
                  >
                    {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => handleDuplicate(link)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    title="Duplicate link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(link)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    title="Edit link"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirmId(linkId)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div
            className="w-full max-w-lg bg-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 my-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-orange-400" />
                <span>{editingLink ? 'Edit Link' : 'Add New Link'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Link Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Order Online, Find Us on Map, Follow Instagram"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subtitle / Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Handcrafted fresh artisan sourdough & pastries"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Link Type</label>
                  <select
                    value={formData.type || 'website'}
                    onChange={(e) => {
                      const newType = e.target.value as LinkType;
                      let defaultIcon = 'Globe';
                      if (newType === 'whatsapp') defaultIcon = 'MessageCircle';
                      if (newType === 'instagram') defaultIcon = 'Instagram';
                      if (newType === 'map') defaultIcon = 'MapPin';
                      if (newType === 'phone') defaultIcon = 'PhoneCall';
                      if (newType === 'email') defaultIcon = 'Mail';
                      if (newType === 'product') defaultIcon = 'ShoppingBag';
                      if (newType === 'booking') defaultIcon = 'Calendar';
                      setFormData({ ...formData, type: newType, icon: defaultIcon });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="website">Website URL</option>
                    <option value="whatsapp">WhatsApp Direct</option>
                    <option value="instagram">Instagram</option>
                    <option value="map">Google Maps</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="product">Product / Menu</option>
                    <option value="booking">Booking / Reserve</option>
                    <option value="custom">Custom Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge (Optional)</label>
                  <input
                    type="text"
                    value={formData.customBadge || ''}
                    onChange={(e) => setFormData({ ...formData, customBadge: e.target.value })}
                    placeholder="e.g. Popular, Hot, New"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination URL</label>
                <input
                  type="text"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={
                    formData.type === 'whatsapp'
                      ? 'Leave blank to use business WhatsApp number'
                      : 'https://example.com'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Icon</label>
                <div className="grid grid-cols-8 gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto">
                  {availableIconNames.map((iconName) => {
                    const isSelected = formData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={iconName}
                      >
                        <IconRenderer name={iconName} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Featured (Highlighted style)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-300">Active (Public)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.openInNewTab ?? true}
                    onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-300">Open in New Tab</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLink}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {savingLink ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingLink ? 'Save Changes' : 'Create Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete this link?"
        message="Are you sure you want to permanently delete this link? This action cannot be undone."
        confirmLabel="Delete Link"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};
