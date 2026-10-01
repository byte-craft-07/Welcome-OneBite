import { z } from 'zod';

// URL validator ensuring safe protocols
export const safeUrlSchema = z.string().trim().refine(
  (val) => {
    if (!val || val === '') return true;
    const lower = val.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
      return false;
    }
    return true;
  },
  { message: 'URL contains an unsafe protocol (javascript:, data:, vbscript: are blocked)' }
);

// Slug validator
export const slugSchema = z
  .string()
  .trim()
  .min(2, 'Slug must be at least 2 characters')
  .max(60, 'Slug must be under 60 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric and hyphens only (e.g. onebite-bakery)');

// Business validation
export const businessUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Business name is required').max(100),
  slug: slugSchema,
  tagline: z.string().trim().max(160).optional().or(z.literal('')),
  shortDescription: z.string().trim().max(300).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  category: z.string().trim().max(50).optional().or(z.literal('')),
  logoUrl: safeUrlSchema.optional().or(z.literal('')),
  coverImageUrl: safeUrlSchema.optional().or(z.literal('')),
  profileImageUrl: safeUrlSchema.optional().or(z.literal('')),
  phone: z.string().trim().max(25).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(25).optional().or(z.literal('')),
  whatsappDefaultMessage: z.string().trim().max(300).optional().or(z.literal('')),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  websiteUrl: safeUrlSchema.optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().trim().max(150).optional().or(z.literal('')),
      city: z.string().trim().max(100).optional().or(z.literal('')),
      state: z.string().trim().max(100).optional().or(z.literal('')),
      country: z.string().trim().max(100).optional().or(z.literal('')),
      pincode: z.string().trim().max(20).optional().or(z.literal('')),
      fullAddress: z.string().trim().max(300).optional().or(z.literal('')),
    })
    .optional(),
  mapUrl: safeUrlSchema.optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instagramUrl: safeUrlSchema.optional().or(z.literal('')),
  facebookUrl: safeUrlSchema.optional().or(z.literal('')),
  youtubeUrl: safeUrlSchema.optional().or(z.literal('')),
  twitterUrl: safeUrlSchema.optional().or(z.literal('')),
  linkedinUrl: safeUrlSchema.optional().or(z.literal('')),
  timezone: z.string().trim().default('Asia/Kolkata'),
  isPublished: z.boolean().default(true),
  isVerified: z.boolean().default(true),
  aboutSection: z
    .object({
      enabled: z.boolean().default(true),
      title: z.string().trim().max(100).default('About Us'),
      description: z.string().trim().max(2500).default(''),
      imageUrl: safeUrlSchema.optional().or(z.literal('')),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().trim().max(120).optional().or(z.literal('')),
      description: z.string().trim().max(250).optional().or(z.literal('')),
      keywords: z.array(z.string().trim()).optional(),
      ogImage: safeUrlSchema.optional().or(z.literal('')),
    })
    .optional(),
});

// Link validation
export const linkCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().max(250).optional().or(z.literal('')),
  type: z.enum([
    'website',
    'whatsapp',
    'phone',
    'email',
    'map',
    'instagram',
    'facebook',
    'youtube',
    'custom',
    'product',
    'category',
    'booking',
    'about',
  ]),
  url: safeUrlSchema.optional().or(z.literal('')),
  icon: z.string().trim().default('Globe'),
  imageUrl: safeUrlSchema.optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  openInNewTab: z.boolean().default(true),
  sortOrder: z.number().default(0),
  customBadge: z.string().trim().max(30).optional().or(z.literal('')),
  highlightColor: z.string().trim().max(30).optional().or(z.literal('')),
});

// Hours validation
export const dayScheduleSchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isOpen: z.boolean(),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
});

export const hoursUpdateSchema = z.object({
  timezone: z.string().trim().default('Asia/Kolkata'),
  days: z.array(dayScheduleSchema),
  specialNotes: z.string().trim().max(300).optional().or(z.literal('')),
});

// Appearance validation
export const appearanceUpdateSchema = z.object({
  theme: z.enum(['classic', 'minimal', 'elegant', 'modern', 'dark', 'soft', 'bakery', 'neon']),
  primaryColor: z.string().trim().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Invalid hex color'),
  secondaryColor: z.string().trim().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Invalid hex color'),
  backgroundColor: z.string().trim(),
  cardBackgroundColor: z.string().trim().optional(),
  textColor: z.string().trim().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Invalid hex color'),
  cardStyle: z.string().trim(),
  buttonStyle: z.string().trim(),
  borderRadius: z.string().trim(),
  fontFamily: z.enum(['sans', 'serif', 'mono']),
  profileLayout: z.enum(['centered', 'banner-avatar', 'clean-compact']),
  backgroundPattern: z.enum(['none', 'dots', 'grid', 'mesh']),
  showVerifiedBadge: z.boolean(),
  showShareButton: z.boolean(),
  showQrButton: z.boolean(),
  showHoursCard: z.boolean(),
  showAboutCard: z.boolean(),
  showContactCard: z.boolean(),
});
