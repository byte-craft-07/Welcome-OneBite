export type LinkType =
  | 'website'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'map'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'custom'
  | 'product'
  | 'category'
  | 'booking'
  | 'about';

export interface BusinessLink {
  id: string;
  _id?: string;
  businessId?: string;
  title: string;
  description?: string;
  type: LinkType;
  url?: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  openInNewTab: boolean;
  sortOrder: number;
  clickCount?: number;
  customBadge?: string;
  highlightColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface BusinessHours {
  timezone: string;
  days: DaySchedule[];
  specialNotes?: string;
}

export interface OpenStatus {
  isOpen: boolean;
  statusText: string;
  nextStatusMessage: string;
  todayHours: string;
  currentDay: string;
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  fullAddress?: string;
}

export interface AboutSection {
  enabled: boolean;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface BusinessSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface BusinessProfile {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  profileImageUrl?: string;
  phone?: string;
  whatsapp?: string;
  whatsappDefaultMessage?: string;
  directWhatsAppUrl?: string;
  email?: string;
  websiteUrl?: string;
  address?: BusinessAddress;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  timezone: string;
  isPublished?: boolean;
  isVerified?: boolean;
  aboutSection?: AboutSection;
  seo?: BusinessSEO;
}

export type ThemePreset =
  | 'classic'
  | 'minimal'
  | 'elegant'
  | 'modern'
  | 'dark'
  | 'soft'
  | 'bakery'
  | 'neon';

export interface BusinessAppearance {
  theme: ThemePreset;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackgroundColor?: string;
  textColor: string;
  cardStyle: string;
  buttonStyle: string;
  borderRadius: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  profileLayout: 'centered' | 'banner-avatar' | 'clean-compact';
  backgroundPattern: 'none' | 'dots' | 'grid' | 'mesh';
  showVerifiedBadge: boolean;
  showShareButton: boolean;
  showQrButton: boolean;
  showHoursCard: boolean;
  showAboutCard: boolean;
  showContactCard: boolean;
}

export interface PublicBusinessData {
  business: BusinessProfile;
  links: BusinessLink[];
  hours: BusinessHours | null;
  openStatus: OpenStatus | null;
  appearance: BusinessAppearance;
}

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'business_admin';
  businessIds: string[];
  businesses?: Array<{ _id: string; name: string; slug: string; logoUrl?: string }>;
}
