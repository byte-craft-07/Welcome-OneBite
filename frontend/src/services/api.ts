import {
  PublicBusinessData,
  BusinessProfile,
  BusinessLink,
  BusinessHours,
  BusinessAppearance,
  User,
} from '../types';

const rawApiBase = (import.meta as any).env?.VITE_API_BASE_URL;
export const API_BASE = rawApiBase
  ? rawApiBase.endsWith('/api')
    ? rawApiBase
    : `${rawApiBase.replace(/\/$/, '')}/api`
  : '/api';

export const getFullImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const rawBase = (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_API_BASE_URL;
  if (!rawBase) return url;
  const backendBase = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return url.startsWith('/') ? `${backendBase}${url}` : `${backendBase}/${url}`;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('hub_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('hub_auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('hub_auth_token');
};

export const getActiveBusinessId = (): string | null => {
  return localStorage.getItem('hub_active_business_id');
};

export const setActiveBusinessId = (id: string): void => {
  localStorage.setItem('hub_active_business_id', id);
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const businessId = getActiveBusinessId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (businessId) {
    headers['x-business-id'] = businessId;
  }
  return headers;
};

export const api = {
  // Public APIs
  async getPublicBusiness(slug = 'onebite-bakery'): Promise<PublicBusinessData> {
    const res = await fetch(`${API_BASE}/public/business/${slug}`);
    if (!res.ok) {
      throw new Error(`Failed to load business profile: ${res.statusText}`);
    }
    return res.json();
  },

  async trackPageView(slug: string, referrer = ''): Promise<void> {
    try {
      await fetch(`${API_BASE}/public/business/${slug}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer }),
        keepalive: true,
      });
    } catch (e) {
      // Non-blocking
    }
  },

  async trackLinkClick(slug: string, linkId: string, referrer = ''): Promise<void> {
    try {
      await fetch(`${API_BASE}/public/business/${slug}/links/${linkId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer }),
        keepalive: true,
      });
    } catch (e) {
      // Non-blocking
    }
  },

  async getBusinessQR(slug: string, color?: string, bgcolor?: string): Promise<{ publicUrl: string; qrDataUrl: string }> {
    const params = new URLSearchParams();
    if (color) params.append('color', color);
    if (bgcolor) params.append('bgcolor', bgcolor);
    const res = await fetch(`${API_BASE}/public/business/${slug}/qr?${params.toString()}`);
    return res.json();
  },

  // Auth APIs
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }
    setAuthToken(data.token);
    return data;
  },

  async pinLogin(pin: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/pin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Incorrect PIN code');
    }
    setAuthToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Session expired');
    }
    return data;
  },

  async updatePin(newPin: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/pin`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ newPin }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update PIN');
    }
  },

  // Admin Business APIs
  async getBusinesses(): Promise<{ businesses: BusinessProfile[] }> {
    const res = await fetch(`${API_BASE}/admin/businesses`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load businesses');
    return data;
  },

  async getAdminBusiness(businessId?: string): Promise<{ business: BusinessProfile }> {
    const url = businessId ? `${API_BASE}/admin/business?businessId=${businessId}` : `${API_BASE}/admin/business`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load business profile');
    return data;
  },

  async updateBusiness(business: Partial<BusinessProfile> & { businessId?: string }): Promise<{ business: BusinessProfile }> {
    const res = await fetch(`${API_BASE}/admin/business`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(business),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update business');
    return data;
  },

  async createBusiness(business: Partial<BusinessProfile>): Promise<{ business: BusinessProfile }> {
    const res = await fetch(`${API_BASE}/admin/businesses`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(business),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create business');
    return data;
  },

  // Admin Links APIs
  async getAdminLinks(businessId?: string): Promise<{ links: BusinessLink[] }> {
    const url = businessId ? `${API_BASE}/admin/links?businessId=${businessId}` : `${API_BASE}/admin/links`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load links');
    return data;
  },

  async createLink(linkData: Partial<BusinessLink> & { businessId?: string }): Promise<{ link: BusinessLink }> {
    const res = await fetch(`${API_BASE}/admin/links`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(linkData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create link');
    return data;
  },

  async updateLink(id: string, linkData: Partial<BusinessLink>): Promise<{ link: BusinessLink }> {
    const res = await fetch(`${API_BASE}/admin/links/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(linkData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update link');
    return data;
  },

  async deleteLink(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/links/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete link');
  },

  async duplicateLink(id: string): Promise<{ link: BusinessLink }> {
    const res = await fetch(`${API_BASE}/admin/links/${id}/duplicate`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to duplicate link');
    return data;
  },

  async toggleLinkActive(id: string): Promise<{ link: BusinessLink; message: string }> {
    const res = await fetch(`${API_BASE}/admin/links/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to toggle link');
    return data;
  },

  async reorderLinks(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/links/reorder`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reorder links');
  },

  // Hours APIs
  async getHours(businessId?: string): Promise<{ hours: BusinessHours }> {
    const url = businessId ? `${API_BASE}/admin/hours?businessId=${businessId}` : `${API_BASE}/admin/hours`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load hours');
    return data;
  },

  async updateHours(hoursData: Partial<BusinessHours> & { businessId?: string }): Promise<{ hours: BusinessHours }> {
    const res = await fetch(`${API_BASE}/admin/hours`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(hoursData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update hours');
    return data;
  },

  // Appearance APIs
  async getAppearance(businessId?: string): Promise<{ appearance: BusinessAppearance }> {
    const url = businessId ? `${API_BASE}/admin/appearance?businessId=${businessId}` : `${API_BASE}/admin/appearance`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load appearance');
    return data;
  },

  async updateAppearance(appearanceData: Partial<BusinessAppearance> & { businessId?: string }): Promise<{ appearance: BusinessAppearance }> {
    const res = await fetch(`${API_BASE}/admin/appearance`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(appearanceData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update appearance');
    return data;
  },

  // Analytics APIs
  async getAnalytics(businessId?: string, days = '30'): Promise<any> {
    const url = `${API_BASE}/admin/analytics?days=${days}${businessId ? `&businessId=${businessId}` : ''}`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load analytics');
    return data;
  },

  // Image Upload
  async uploadImage(file: File): Promise<{ url: string }> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Image upload failed');
    }
    return { url: data.file.url };
  },
};
