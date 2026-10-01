import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
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
  email?: string;
  websiteUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    fullAddress?: string;
  };
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  timezone: string;
  isPublished: boolean;
  isVerified: boolean;
  aboutSection?: {
    enabled: boolean;
    title?: string;
    description?: string;
    imageUrl?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tagline: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, default: 'General' },
    logoUrl: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    profileImageUrl: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    whatsappDefaultMessage: { type: String, trim: true, default: 'Hello! I found your business on your Link Hub and would like more information.' },
    email: { type: String, trim: true, lowercase: true },
    websiteUrl: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
      pincode: { type: String, trim: true },
      fullAddress: { type: String, trim: true },
    },
    mapUrl: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    instagramUrl: { type: String, trim: true },
    facebookUrl: { type: String, trim: true },
    youtubeUrl: { type: String, trim: true },
    twitterUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    timezone: { type: String, default: 'Asia/Kolkata', trim: true },
    isPublished: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: true },
    aboutSection: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'About Us' },
      description: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
    },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
      ogImage: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export const Business = mongoose.model<IBusiness>('Business', businessSchema);
